const nodeJsPath = require("path");
const fs = require("fs");

const {transform, Switch, Any} = require("./transform");

const Data = require("../data");

const generateSource = require("babel-generator").default;

const { preprocess, isRedundantJSXText } = require("./preprocess");

//var dump = require("./dump");


const JS_EXTENSION = ".js";

const NO_MATCH = {
    appName : null,
    processName : null,
    moduleName : null,
    isComposite : null
};

const PROCESS_RESOURCE_REGEX = /^\.\/apps\/(.*?)\/processes\/(.*?)\/(composites\/)?(.*?)$/;

function matchPath(path)
{
    const m = PROCESS_RESOURCE_REGEX.exec(path);
    if (!m)
    {
        return NO_MATCH;
    }

    return {
        appName: m[1],
        processName: m[2],
        moduleName: m[4],
        isComposite: !!m[3]
    }
}

function strip(path, sourceRoot)
{
    if (sourceRoot)
    {
        if (path.indexOf(sourceRoot) !== 0)
        {
            return null;
        }

        return path.substring(sourceRoot.length);
    }
    return path;

}

function ensureDefined(info, value)
{
    if (value === undefined)
    {
        throw new Error(info + " is undefined");
    }

    return value;
}

/**
 * Takes the "name" property of the given node
 */
function TakeName(node)
{
    return ensureDefined(node.type + ".name", node.name);
}

/**
 * Takes the "value" property of the given node
 */
function TakeValue(node)
{
    return ensureDefined(node.type + ".value", node.value);
}

/**
 * Takes the complete source of the node
 */
function TakeSource(node)
{
    if (node === null)
    {
        return null;
    }

    const preprocessed = preprocess(node);
    if (!preprocessed)
    {
        return "";
    }

    //console.log("preprocessed", JSON.stringify(preprocessed,0,4));

    return generateSource( preprocessed, SOURCE_OPTIONS).code;
}

function getRelativeModuleName(opts)
{
    const root = opts.sourceRoot;
    if (!root)
    {
        return null;
    }
    const len = root.length;
    const fullWithExtension = opts.filename.substring(root[len - 1] === nodeJsPath.sep ? len : len + 1);

    return fullWithExtension.substring(0, fullWithExtension.lastIndexOf("."));
}

const SOURCE_OPTIONS = {
    quotes: "double",
    concise: true
};

function getRelativeModulePath(path, pluginOpts)
{
    const module = getRelativeModuleName(path.hub.file.opts);
    if (!module)
    {
        return null;
    }

    const relative = strip(module, pluginOpts.sourceRoot);
    if (!relative)
    {
        return null;
    }

    return "./" + relative;
}

function getNameOrValue(node)
{
    return node.name || node.value;
}

module.exports = function (babel) {

    const t = babel.types;

    function recursiveIdentifierOrPatternRule(node)
    {
        return (
            Switch({
                Identifier: TakeName,
                ObjectPattern: {
                    properties: {
                        key: TakeName,
                        value: recursiveIdentifierOrPatternRule
                    }
                }
            })
        )(node);
    }

    /**
     * Checks if the given node is a fat arrow render function we want to analyze in detail instead of just taking the source.
     *
     * @param node      node
     * @return {boolean}    true if fat arrow render function
     */
    function isRenderFunction(node)
    {
        const { params, body} = node;

        // not a render function if it is not a fat arrow or has no parameters
        if (!t.isArrowFunctionExpression(node) || !params.length)
        {
            return false;
        }

        // without method body it's a render function
        if (!t.isBlockStatement(body))
        {
            return true;
        }

        // otherwise we check if there's a return value

        for (let i = 0; i < body.body.length; i++)
        {
            const n = body.body[i];
            if (n.type === "ReturnStatement")
            {
                return true;
            }
        }
        return false;
    }
    
    function handleRenderFunction(node)
    {
        const isRenderResult = isRenderFunction(node);

        let root, constants = [];

        if ( isRenderResult )
        {
            // type === "ArrowFunctionExpression"
            // shallow traversal over render function body only
            const {body} = node;

            if (t.isBlockStatement(body))
            {
                const kids = body.body;
                for (let i = 0; i < kids.length; i++)
                {
                    const kid = kids[i];

                    if (t.isVariableDeclaration(kid))
                    {
                        constants.push(
                            transform(kid, {
                                kind: true,
                                declarations: {
                                    id: recursiveIdentifierOrPatternRule,
                                    init: TakeSource
                                }
                            })
                        )
                    }
                    else if (t.isReturnStatement(kid))
                    {
                        root = transform(kid.argument, recursiveJSX)
                    }
                }
            }
            else
            {
                // direct return
                root = transform(body, recursiveJSX)
            }


            return {
                type: "JSXRenderFunction",
                params: transform(node.params, recursiveIdentifierOrPatternRule),
                constants: constants,
                root: root
            }
        }
    }

    function recursiveJSX(node)
    {
        return (
            Switch({
                "JSXElement":
                    function (node) {
                        const {openingElement} = node;

                        return {
                            name: TakeSource(openingElement.name),
                            attrs: transform(openingElement.attributes, {
                                name: TakeName,
                                value: function (node) {
                                    return (
                                        Switch({
                                            "JSXExpressionContainer":
                                                function (node) {

                                                    const renderFn = handleRenderFunction(node.expression);
                                                    if (renderFn)
                                                    {
                                                        return renderFn;
                                                    }

                                                    return {
                                                        type: "JSXExpressionContainer",
                                                        code: TakeSource(node)
                                                    }
                                                },
                                            default: {
                                                type: "Expression",
                                                code: TakeSource(node)
                                            }
                                        })
                                    )(node);

                                }
                            }),
                            kids: transform(node.children, function (node) {

                                const renderFn = t.isJSXExpressionContainer(node) && handleRenderFunction(node.expression);
                                if (renderFn)
                                {
                                    return renderFn;
                                }

                                return recursiveJSX(node)
                            })
                        }
                    },
                "JSXText": function (node) {

                    const {value} = node;
                    if (!isRedundantJSXText(node))
                    {
                        return {
                            type: "JSXText",
                            value: value
                        }
                    }
                },

                "JSXExpressionContainer": function (node) {
                    return (
                        Switch({
                            "JSXExpressionContainer":
                                function (node) {

                                    const renderFn = handleRenderFunction(node);
                                    if (renderFn)
                                    {
                                        return renderFn;
                                    }

                                    return {
                                        type: "JSXExpressionContainer",
                                        code: TakeSource(node)
                                    }
                                },
                            default: {
                                type: "Expression",
                                code: TakeSource(node)
                            }
                        })
                    )(node);

                },
                default: {
                    type: "Expression",
                    code: TakeSource(node)
                }
            })
        )(node);

    }

    /**
     * Handles the view components and form components that are simplified composite react components.
     *
     * @param path
     * @return {{type: string, constants: Array, root: null}}
     */
    function createCompositeComponentDefinition(path)
    {
        const classDeclaration = {
            type: "CompositeComponent",
            constants: [],
            root: null
        };

        //console.log("CLASS", JSON.stringify(classDeclaration));

        path.traverse({
            "ClassMethod": function (path, state) {
                const {node} = path;
                if (node.kind === "method")
                {

                    const methodName = getNameOrValue(node.key);
                    if (methodName !== "render")
                    {
                        throw new Error("Composite components should only contain a render method: Found '" + methodName + "' in " + path + JS_EXTENSION);
                    }

                    // shallow traversal over render body only
                    const {body} = node;

                    if (t.isBlockStatement(body))
                    {
                        const kids = body.body;
                        for (let i = 0; i < kids.length; i++)
                        {
                            const kid = kids[i];

                            if (t.isVariableDeclaration(kid))
                            {
                                classDeclaration.constants.push(
                                    transform(kid, {
                                        kind: true,
                                        declarations: {
                                            id: recursiveIdentifierOrPatternRule,
                                            init: TakeSource
                                        }
                                    })
                                )
                            }
                            else if (t.isReturnStatement(kid))
                            {
                                classDeclaration.root = transform(kid.argument, recursiveJSX)
                            }
                        }
                    }
                    else
                    {
                        // direct return
                        classDeclaration.root = transform(body, recursiveJSX)
                    }
                }
            }
        });

        return classDeclaration;
    }

    function transformDecorators(decorators)
    {
        return transform(decorators, function(decorator){

            const { expression } = decorator;

            if (t.isCallExpression(expression))
            {
                return {
                    name: expression.callee.name,
                    arguments: transform(expression.arguments, TakeSource)
                };
            }

            return {
                name: expression
            }
        });
    }

    function findDecorator(decorators, name)
    {
        for (let i = 0; i < decorators.length; i++)
        {
            const decorator = decorators[i];
            if (decorator.name === name)
            {
                return decorator;
            }

        }
        return null;
    }

    function createProcessExports(path)
    {
        const processExports = {
            type: "ProcessExports",
            config: [],
            states: null,
            scope: {
                name: null,
                observables: [],
                actions: [],
                computeds: [],
                helpers: []
            }
        };


        //console.log("CLASS", JSON.stringify(processExports));

        path.traverse({

            "ExportNamedDeclaration": function (path, state) {
                const {node} = path;
                const {declarations} = node.declaration;

                for (let i = 0; i < declarations.length; i++)
                {
                    const decl = declarations[i];
                    if (t.isIdentifier(decl) && dec.name === "initProcess")
                    {

                    }
                }
            },

            "ExportDefaultDeclaration" : function (path, state) {
                const { declaration } = node;

                if (!t.isClassDeclaration(declaration))
                {
                    throw new Error("Default process export must be scope class")
                }

                const { scope } = processExports;

                scope.name = declaration.id.name;

                // shallow traversal over class body only
                const { body } = declaration.body;

                for (let i = 0; i < body.length; i++)
                {
                    const kid = body[i];

                    if (t.isClassProperty(kid))
                    {
                        const decorators = transformDecorators(kid.decorators)

                        if (findDecorator(decorators, "observable"))
                        {
                            scope.observables.push({
                                name: kid.key.name,
                                value: Take
                            })
                        }
                    }
                    else if (t.isClassMethod(kid))
                    {

                        if (findDecorator(decorators, "action"))
                        {
                            scope.actions.push({

                            })
                        }
                        else if (findDecorator(decorators, "computed"))
                        {
                            scope.computeds.push({

                            })
                        }
                        else
                        {
                            helpers.push(TakeSource(kid));
                        }
                    }
                }
            }
        });

        return processExports;

    }

    return {
        visitor: {
            "ImportDeclaration": function (path, state) {
                const {node} = path;
                const pluginOpts = state.opts;
                const relativePath = getRelativeModulePath(path, pluginOpts);

                if (relativePath && relativePath.indexOf("./apps/") === 0)
                {
                    const importDeclaration = transform(
                        node,
                        // one import statement
                        {
                            type: "ImportDeclaration",
                            source: TakeValue,
                            specifiers: Switch({
                                "ImportSpecifier": {
                                    imported: TakeName,
                                    local: TakeName
                                },

                                "ImportDefaultSpecifier": {
                                    local: TakeName
                                },

                                "ImportNamespaceSpecifier": {
                                    local: TakeName
                                }
                            })
                        }
                    );

                    //console.log("IMPORT", JSON.stringify(importDeclaration));

                    Data.entry(relativePath, true).importDeclarations.push(
                        importDeclaration
                    );
                }
            },

            "ClassDeclaration": function (path, state) {
                const {node} = path;
                const pluginOpts = state.opts;
                const relativePath = getRelativeModulePath(path, pluginOpts);

                const { appName, processName, moduleName, isComposite } = matchPath(relativePath);

                console.log({ appName, processName, moduleName, isComposite });

                if (processName)
                {
                    if (isComposite)
                    {
                        const { name } = node.id;

                        if ( moduleName === name)
                        {
                            Data.entry(relativePath, true).composite = createCompositeComponentDefinition(path);
                        }
                    }
                    else  if (processName === moduleName)
                    {
                        Data.entry(relativePath, true).processExports = createProcessExports(path)
                    }
                }
            }
        }
    };
};

