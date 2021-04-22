const nodeJsPath = require("path");
const fs = require("fs");

const { transform, Switch, Any } = require("./transform");

const Data = require("../data");

const generateSource = require("@babel/generator").default;

const { preprocess, isRedundantJSXText } = require("./preprocess");

//var dump = require("./dump");


const JS_EXTENSION = ".js";

const NO_MATCH = {
    appName : null,
    processName : null,
    moduleName : null,
    isComposite : null
};

const MODEL_RESOURCE_REGEX = /^\.\/apps\/(.*?)\/(processes\/(.*?)\/(composites\/|queries\/|states\/)?|(domain\/)|(queries\/))?(.*?)$/;

function matchPath(path)
{

    const m = MODEL_RESOURCE_REGEX.exec(path);
    //console.log("matchPath", path, "=>", m);
    if (!m)
    {
        return NO_MATCH;
    }

    return {
        appName: m[1],
        processName: m[3],
        moduleName: m[7],
        isDomain: !!m[5],
        isComposite: m[4] === "composites/",
        isQuery: m[4] === "queries/" || !!m[6],
        isState: m[4] === "states/"
    }
}

var SLASH_RE = new RegExp("\\" + nodeJsPath.sep, "g");
function strip(path, sourceRoot)
{
    if (nodeJsPath.sep !== "/")
    {
        path = path.replace( SLASH_RE, "/")
    }

    //console.log("STRIP", path, sourceRoot);

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

function toSource(node)
{
    return generateSource(node, SOURCE_OPTIONS);
}

function getRelativeModuleName(opts)
{

    const root =  opts.root || opts.sourceRoot;
    //console.log("root = ", root)
    if (!root)
    {
        return null;
    }
    const len = root.length;
    const fullWithExtension = opts.filename.substring(root[len - 1] === nodeJsPath.sep ? len : len + 1);

    const result = fullWithExtension.substring(0, fullWithExtension.lastIndexOf("."));

    //console.log("result = ", result)

    return result;
}

const SOURCE_OPTIONS = {
    quotes: "double",
    concise: true
};

function getRelativeModulePath(path, pluginOpts)
{
    //console.log("getRelativeModulePath", path.hub.file.opts)

    if (!path.hub)
    {
        return null;
    }

    const module = getRelativeModuleName(path.hub.file.opts);
    if (!module)
    {
        return null;
    }

    //console.log("MOD", module, pluginOpts.sourceRoot);

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

function trim(value)
{
    return value.replace(/^[ \r\t\n]*(.*?)[ \r\t\n]*$/, "$1");
}

function extractLeadingComments(node)
{
    const { leadingComments } = node;

    return leadingComments ? transform(leadingComments, function (node) {

        const value = TakeValue(node);

        return trim(value)

    }).join("\n") : null;
}

function decapitalize(s)
{
    return s.charAt(0).toLowerCase() + s.substr(1);
}


function isTransitionMapFunction(node)
{
    if (node.type !== "ArrowFunctionExpression")
    {
        return false;
    }

    if (node.params.length !== 2)
    {
        return false;
    }

    return node.body.type === "ObjectExpression";
}


function isImportedState(path, name)
{
    const program = path.findParent(path => path.isProgram());
    return !!program.node.body.find(
        node =>
            node.type === "ImportDeclaration" &&
            node.source.value === "./states/" + name &&
            node.specifiers.length === 1 && node.specifiers[0].type === "ImportDefaultSpecifier" &&
            node.specifiers[0].local.name === name
    )
}


function getFirstMember(memberExpression)
{
    let current = memberExpression;
    while (current.object.type === "MemberExpression")
    {
        current = current.object;
    }

    if (current.object.type === "Identifier")
    {
        return current.object.name;
    }
    return null;
}


module.exports = function (babel) {

    const t = babel.types;


    function staticEval(node, allowIdentifier)
    {
        var i, out, evaluatedValue;

        if (t.isTemplateLiteral(node))
        {
            if (node.expressions.length > 0)
            {
                throw new Error("Extracted template literals can't contain expressions");
            }

            return node.quasis[0].value.raw;
        }
        else if (t.isNullLiteral(node))
        {
            return null;
        }
        else if (t.isLiteral(node))
        {
            return node.value;
        }
        else if (t.isArrayExpression(node))
        {
            var elements = node.elements;
            out = new Array(elements.length);
            for (i = 0; i < elements.length; i++)
            {
                evaluatedValue = staticEval(elements[i], allowIdentifier);

                if (evaluatedValue !== undefined)
                {
                    out[i] = evaluatedValue;
                }
                else
                {
                    // non-literal array element -> bail
                    return undefined;
                }
            }
            return out;
        }
        else if (t.isObjectExpression(node))
        {
            var properties = node.properties;
            out = {};
            for (i = 0; i < properties.length; i++)
            {
                var key, property = properties[i];
                if (t.isLiteral(property.key))
                {
                    key = property.key.value;
                }
                else if (t.isIdentifier(property.key))
                {
                    key = property.key.name;
                }
                else
                {
                    // computed property -> bail
                    return undefined;
                }

                evaluatedValue = staticEval(property.value, allowIdentifier);

                if (evaluatedValue !== undefined)
                {
                    out[key] = evaluatedValue;
                }
                else
                {
                    // non-literal value -> bail
                    return undefined;
                }
            }
            return out;
        }
        else if (allowIdentifier && t.isIdentifier(node))
        {
            return { __identifier: node.name };
        }

        return undefined;
    }

    /**
     * Returns true if the given node is an arrow function <code>props => { }</code>
     * @param node
     * @return {boolean}
     */
    function isReactArrowFunctionComponent(node)
    {
        // must be arrow function
        if (!t.isArrowFunctionExpression(node))
        {
            return false;
        }

        // accepting exactly one parameter named props
        return node.params.length === 1 && node.params[0].name === "props";
    }


    function recursiveIdentifierOrPatternRule(node)
    {
        return (
            Switch({
                Identifier: {
                    name: true
                },
                ObjectPattern: {
                    properties: {
                        key: TakeName,
                        value: recursiveIdentifierOrPatternRule
                    }
                },
                ArrayPattern: {
                    elements: recursiveIdentifierOrPatternRule
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
        const { params, body } = node;

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
            // shallow traversal over render function body only
            const { body } = node;

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

    function recursiveJSX(node, renderedIf)
    {
        return (
            Switch({
                "JSXElement":
                    function (node) {
                        const { openingElement } = node;

                        const transformedElement = {
                            name: TakeSource(openingElement.name),
                            attrs: transform(openingElement.attributes, {
                                name: TakeName,
                                value: function (node) {

                                    if (node === null)
                                    {
                                        return null;
                                    }

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

                                if (t.isJSXExpressionContainer(node))
                                {
                                    const { expression } = node;

                                    if (
                                        t.isLogicalExpression(expression) &&
                                        expression.operator === "&&" &&
                                        t.isJSXElement(expression.right)
                                    )
                                    {
                                        return recursiveJSX(expression.right, {
                                            "type": "JSXAttribute",
                                            name: "renderedIf",
                                            value: {
                                                type: "Expression",
                                                code: TakeSource(expression.left)
                                            }
                                        });
                                    }

                                    const renderFn =  handleRenderFunction(node.expression);
                                    if (renderFn)
                                    {
                                        return renderFn;
                                    }
                                }
                                return recursiveJSX(node)
                            })
                        };

                        if (renderedIf)
                        {
                            transformedElement.attrs.push(renderedIf);
                        }

                        return transformedElement;
                    },
                "JSXText": function (node) {

                    const { value } = node;
                    if (!isRedundantJSXText(node))
                    {
                        return {
                            type: "JSXText",
                            value: trim(value)
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
     * @param node
     * @return {{type: string, constants: Array, root: null}}
     */
    function createCompositeComponentDefinition(path, node)
    {
        const classDeclaration = {
            type: "CompositeComponent",
            constants: [],
            root: null
        };

        // shallow traversal over render body only
        const { body } = node;

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

        return classDeclaration;
    }

    function transformDecorators(decorators)
    {
        if (!decorators)
        {
            return [];
        }

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
                name: TakeSource(expression)
            }
        });
    }

    function findDecorator(decorators, name)
    {
        const names = Array.isArray(name) ? name : [name];

        for (let i = 0; i < decorators.length; i++)
        {
            const decorator = decorators[i];
            if (names.indexOf(decorator.name) >= 0)
            {
                return decorator;
            }

        }
        return null;
    }

    function findMapProperty(map, name)
    {
        const { properties } = map;

        for (let i = 0; i < properties.length; i++)
        {
            const property = properties[i];
            if (getNameOrValue(property.key) === name)
            {
                return property.value;
            }
        }

        return undefined;
    }

    function transitionMapObject(relativePath, node, path)
    {
        if (t.isStringLiteral(node))
        {
            return node.value;
        }
        if (t.isIdentifier(node))
        {
            return node.name;
        }
        else if (t.isArrowFunctionExpression(node) || t.isFunctionExpression(node))
        {
            const { params, body } = node;

            if (params.length > 1)
            {
                throw new Error(relativePath + ", " + path.join(".") + ": Action function takes at most 1 parameter: (transition)");
            }

            return {
                type : "Action",
                params : transform(params, TakeName),
                code: transform(body, TakeSource)
            };
        }
        else if (t.isArrayExpression(node))
        {
            const { elements } = node;

            const out = [];
            for (let i = 0; i < elements.length; i++)
            {
                out[i] = transitionMapObject(relativePath, elements[i], path.concat(i));
            }
            return out;
        }
        else if (t.isBooleanLiteral(node))
        {
            return node.value;
        }
        else if (t.isMemberExpression(node) && node.object.name === "scope")
        {
            return {
                type : "Action",
                params : [],
                code: TakeSource(node) + "()"
            }
        }
        else if (t.isObjectExpression(node))
        {
            const { properties } = node;

            const out = {};
            for (let i = 0; i < properties.length; i++)
            {
                const property = properties[i];
                const name = getNameOrValue(property.key);
                out[name] = transitionMapObject(relativePath, property.value, path.concat(name));
            }
            return out;
        }
        else
        {
            throw new Error(relativePath + ", " + path.join(".") + ": Invalid transition map object: " + JSON.stringify(node));
        }
    }

    function isValidAction(action)
    {
        if (!action || typeof action !== "object")
        {
            return false;
        }

        const { type, params, code} = action;

        return (
            type === "Action" &&
            Array.isArray(params) &&
            params.length <= 1 &&
            typeof code === "string" &&
            Object.keys(action).length === 3
        );
    }

    const VALID_TRANSITION_KEYS = {
        "action" : true,
        "to" : true,
        "discard" : true,
        "confirmation" : true
    };

    function validateTransitionMap(relativePath, stateObject)
    {
        if (!stateObject || typeof stateObject !== "object")
        {
            throw new Error("transition map root must be an object");
        }

        for (let transitionName in stateObject)
        {
            if (stateObject.hasOwnProperty(transitionName))
            {
                const transitionObject = stateObject[transitionName];
                if (!transitionObject || typeof transitionObject !== "object")
                {
                    throw new Error(relativePath + ", state '" + stateName + "', transition = '" + transitionName + "': value must be an object");
                }

                const { to, action, discard, confirmation } = transitionObject;

                const invalidKeys = Object.keys(transitionObject).filter( n => !VALID_TRANSITION_KEYS.hasOwnProperty(n));
                if (invalidKeys.length > 0)
                {
                    throw new Error(relativePath + ", state '" + stateName + "', Invalid transition key(s): " + invalidKeys.join(","));
                }

                if (!to && !action)
                {
                    throw new Error(relativePath + ", state '" + stateName + "', transition must have at least a 'to' or an 'action' property");
                }

                if (action && !isValidAction(action))
                {
                    throw new Error(relativePath + ", state '" + stateName + "', Invalid action object: " + action);
                }

                if (discard !== undefined && discard !== true && discard !== false)
                {
                    throw new Error(relativePath + ", state '" + stateName + "', Invalid discard value: " + discard);
                }
                if ( confirmation && (typeof confirmation !== "object" || confirmation.type !== "Action"))
                {
                    throw new Error(relativePath + ", state '" + stateName + "', Invalid confirmation value: " + discard);
                }
            }
        }

        return stateObject;
    }

    function createDomainDefinition(relativePath, declaration)
    {
        const scope = {
            name: declaration.id.name,
            observables: [],
            actions: [],
            computeds: [],
            helpers: []
        };

        // shallow traversal over class body only
        const {body} = declaration.body;

        for (let i = 0; i < body.length; i++)
        {
            const kid = body[i];

            const decorators = transformDecorators(kid.decorators);

            //console.log("DECO", decorators);

            if (t.isClassProperty(kid))
            {
                if (findDecorator(decorators, "observable"))
                {
                    //console.log("OBSERVABLE",   JSON.stringify(kid,0,4), "\n----");
                    const comments = extractLeadingComments(kid);
                    scope.observables.push({
                        name: kid.key.name,
                        defaultValue: TakeSource(kid.value),
                        description: comments
                    })
                }
                else
                {
                    const comments = extractLeadingComments(kid);
                    scope.helpers.push({
                        name: kid.key.name,
                        defaultValue: TakeSource(kid.value),
                        description: comments
                    })
                }
            }
            else if (t.isClassMethod(kid))
            {

                const deco = findDecorator(decorators, ["action", "action.bound"]);
                if (deco)
                {
                    const actionName = kid.key.name;
                    if (kid.kind !== "method")
                    {
                        throw new Error(relativePath + ": @action is not a class method: " + actionName);
                    }

                    scope.actions.push({
                        name: actionName,
                        params: transform(kid.params, TakeName),
                        code: transform(kid.body.body, TakeSource).join("\n"),
                        bound: deco.name === "action.bound"
                    })
                }
                else if (findDecorator(decorators, "computed"))
                {
                    const computedName = kid.key.name;
                    if (kid.kind !== "get")
                    {
                        throw new Error(relativePath + ": @computed is not a getter: " + computedName);
                    }

                    scope.computeds.push({
                        name: computedName,
                        code: transform(kid.body.body, TakeSource).join("\n")
                    })
                }
                else
                {
                    const helperName = kid.key.name;
                    if (kid.kind !== "method")
                    {
                        throw new Error(relativePath + ": Helper must be class method: " + helperName);
                    }

                    scope.helpers.push({
                        name: helperName,
                        params: transform(kid.params, TakeName),
                        code: transform(kid.body.body, TakeSource).join("\n")
                    });
                }
            }
        }

        return scope;
    }

    function createDomainModel(relativePath, path, moduleName)
    {
        let domainModel = null;

        path.traverse({

            "ExportDefaultDeclaration" : function (path, state) {


                const { declaration } = path.node;

                if (!t.isClassDeclaration(declaration))
                {
                    throw new Error("Default domain model default export must be class")
                }

                domainModel = createDomainDefinition(relativePath, declaration);

                if (domainModel.name !== moduleName)
                {
                    throw new Error("Domain model must be named the same as the module: is '" + domainModel.name + "', should be '" + moduleName + "'");
                }
            }
        });

        return domainModel;

    }




    function createProcessExports(relativePath, exportsPath)
    {
        const processExports = {
            type: "ProcessExports",

            configuration: [],

            init: [],
            startState: null,
            scope: null,

            extraConstants: []
        };

        exportsPath.traverse({

            "ExportNamedDeclaration": function (path, state) {
                const { node } = path;
                const { declaration } = node;

                if (t.isFunctionDeclaration(declaration) && declaration.id.name === "initProcess")
                {
                    const { body } = declaration;

                    const params = transform(declaration.params, TakeName);

                    if (params.length !== 2 || params[0] !== "process" || params[1] !== "scope")
                    {
                        throw new Error(relativePath + ": initProcess takes exactly 2 parameters which must be named 'process' and 'scope'.");
                    }

                    // shallow traversal over initProcess body only

                    const { configuration, init } = processExports;

                    let process;
                    const kids = body.body;
                    for (let i = 0; i < kids.length; i++)
                    {
                        const kid = kids[i];

                        let done = false;
                        if (t.isReturnStatement(kid))
                        {
                            const node = kid.argument;

                            if (node.type === "Identifier" && isImportedState(path, node.name))
                            {
                                processExports.startState = node.name;
                            }
                        }
                        else if (t.isExpressionStatement(kid))
                        {

                            const { expression } = kid;
                            const comments = extractLeadingComments(kid);

                            if (t.isAssignmentExpression(expression))
                            {
                                const { left } = expression;

                                if (t.isMemberExpression(left) && params.indexOf(getFirstMember(left)) >= 0)
                                {
                                    const code = TakeSource(expression);
                                    if (comments)
                                    {
                                        configuration.push(
                                            "/* " + comments + " /*\n",
                                            code
                                        );
                                    }
                                    else
                                    {
                                        configuration.push(code);
                                    }
                                    done = true;
                                }
                            }
                            else if (t.isCallExpression(expression))
                            {
                                const { callee } = expression;

                                if (t.isMemberExpression(callee) && params.indexOf(callee.object.name) >= 0)
                                {
                                    const code = TakeSource(expression);
                                    if (comments)
                                    {
                                        configuration.push(
                                            "/* " + comments + "/*\n",
                                            code
                                        );
                                    }
                                    else
                                    {
                                        configuration.push(code);
                                    }
                                    done = true;
                                }
                            }
                        }
                        if (!done)
                        {
                            const code = TakeSource(kid);
                            init.push(code);
                        }
                    }
                }
            },

            "ExportDefaultDeclaration" : function (path, state) {


                const { declaration } = path.node;

                if (!t.isClassDeclaration(declaration))
                {
                    throw new Error("Default process export must be scope class")
                }

                processExports.scope = createDomainDefinition(relativePath, declaration);
            },

            "VariableDeclaration": function (path, state) {

                const {node, parent} = path;

                const isExport = t.isExportNamedDeclaration(parent);

                // we are only interested in root declarations or exports
                if ( (!t.isProgram(parent) && !isExport))
                {
                    // ignore
                    return;
                }

                processExports.extraConstants.push((isExport ? "export " : "") + TakeSource(node))
            },
            "FunctionDeclaration": function (path, state) {

                const {node, parent} = path;


                const isExport = t.isExportNamedDeclaration(parent);

                // we are only interested in root declarations or exports and we ignore "initProcess"
                if (node.id.name === "initProcess" || (!t.isProgram(parent) && !isExport))
                {
                    // ignore
                    return;
                }


                processExports.extraConstants.push((isExport ? "export " : "") + TakeSource(node))
            }
        });

        return processExports;

    }

    const SCOPE_NAMES = [
        "ApplicationScope",
        "UserScope",
        "SessionScope"
    ];

    function createScopeDefinitions(relativePath, path, state)
    {
        const scopes = {};
        const pluginOpts = state.opts;

        path.traverse({
            "ClassDeclaration": function (path) {
                const { node } = path;
                const relativePath = getRelativeModulePath(path, pluginOpts);

                if (SCOPE_NAMES.indexOf(node.id.name) >= 0)
                {
                    scopes[decapitalize(node.id.name)] = createDomainDefinition(relativePath, path.node)
                }
            }
        });

        return scopes;
    }


    function createNamedQuery(relativePath, path)
    {
        let namedQuery = {
        };

        path.traverse({

            "ExportDefaultDeclaration" : function (path, state) {


                const { declaration } = path.node;

                if (!t.isCallExpression(declaration) || !declaration.callee || declaration.callee.name !== "query")
                {
                    throw new Error("Default export of query module must be a query() call.")
                }

                const { arguments: args } = declaration;
                if (args.length === 0)
                {
                    throw new Error("query(query,variables) needs at least a query string parameter");
                }

                const query = staticEval(args[0], false);
                const variables = args.length > 1 ? staticEval(args[1], false) : null;

                if (query === undefined || variables === undefined)
                {
                    throw new Error("Query in " + relativePath + " could not be statically evaluated");
                }

                namedQuery.query = query;
                namedQuery.variables = variables;
            },

        });

        return namedQuery;
    }


    function getExtraConstants(relativePath, path, moduleName)
    {
        //console.log("getExtraConstants", moduleName);

        const extraConstants = [];

        path.traverse({

            "VariableDeclaration": function (path, state) {
                const {node, parent} = path;

                const isExport = t.isExportNamedDeclaration(parent);

                // we are only interested in root declarations or exports
                if ((!t.isProgram(parent) && !isExport))
                {
                    // ignore
                    return;
                }

                if (node.declarations[0].id.name === moduleName)
                {
                    // ignore composite itself
                    return;
                }

                extraConstants.push((isExport ? "export " : "") + TakeSource(node))
            },

            "FunctionDeclaration": function (path, state) {

                const {node, parent} = path;


                const isExport = t.isExportNamedDeclaration(parent);

                // we are only interested in root declarations or exports and we ignore "initProcess"
                if ((!t.isProgram(parent) && !isExport))
                {
                    // ignore
                    return;
                }

                extraConstants.push((isExport ? "export " : "") + TakeSource(node))
            }

        });
        return extraConstants;
    }


    function createViewStateDefinition(relativePath, path, name, transitionMapFn, componentFn)
    {
        const transitionMap =
            validateTransitionMap(
                relativePath,
                transitionMapObject(relativePath, transitionMapFn.body, [""])
            );

        return {
            type: "ViewState",
            name,
            transitionMap,
            composite: createCompositeComponentDefinition(path, componentFn)
        };
    }


    function createStateModel(relativePath, path, moduleName)
    {
        // we only support ViewState for now
        
        let viewStateModel = null;

        path.traverse({

            "VariableDeclaration" : function (path, state) {


                const {parent} = path;

                // we are only interested in root declarations or exports
                if (!t.isProgram(parent))
                {
                    // ignore
                    return;
                }

                const { declarations } = path.node;


                const declarator = declarations[0];

                if (
                    declarator.id.name === moduleName &&
                    declarator.init.type === "NewExpression" &&
                    declarator.init.callee.name === "ViewState"
                )
                {
                    if (declarator.init.arguments.length !== 3)
                    {
                        throw new Error("Wrong view state constructor in " + moduleName);
                    }

                    const [ nameDecl, transitionMapFn, componentFn ] = declarator.init.arguments;

                    if (nameDecl.type !== "StringLiteral" || nameDecl.value !== moduleName)
                    {
                        throw new Error("Error in module " + moduleName + ": view state name must be the same as module name (" + moduleName + "), is " + nameDecl.value);
                    }

                    if (!isTransitionMapFunction(transitionMapFn))
                    {
                        throw new Error("Error in module " + moduleName + ": Invalid transition map function: " + JSON.stringify(transitionMapFn));
                    }

                    if (!isReactArrowFunctionComponent(componentFn))
                    {
                        throw new Error("Error in module " + moduleName + ": view state name must be the same as module name, is " + declarator.init.arguments[0].name);
                    }

                    viewStateModel = createViewStateDefinition(relativePath, path, moduleName, transitionMapFn, componentFn);
                }
            }
        });

        return viewStateModel;

    }


    return {
        visitor: {
            "ImportDeclaration": function (path, state) {
                const { node } = path;
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
                                "ImportSpecifier": function(node)
                                {
                                    const result = {
                                        type: "ImportSpecifier",
                                        name: TakeName(node.local)
                                    };

                                    const imported = TakeName(node.imported);

                                    if (result.name !== imported)
                                    {
                                        result.aliasOf = imported;
                                    }
                                    return result
                                },

                                "ImportDefaultSpecifier": function(node)
                                {
                                    return {
                                        type: "ImportDefaultSpecifier",
                                        name: TakeName(node.local)
                                    }
                                },

                                "ImportNamespaceSpecifier": function(node)
                                {
                                    return {
                                        type: "ImportNamespaceSpecifier",
                                        name: TakeName(node.local)
                                    }
                                },
                            })
                        }
                    );

                    //console.log("IMPORT", JSON.stringify(importDeclaration));

                    Data.entry(relativePath, true).importDeclarations.push(
                        importDeclaration
                    );
                }
            },

            "VariableDeclaration": function (path, state) {
                const { node, parent } = path;
                const pluginOpts = state.opts;
                const relativePath = getRelativeModulePath(path, pluginOpts);

                const { appName, processName, moduleName, isComposite } = matchPath(relativePath);

                //console.log({ appName, processName, moduleName, isComposite });

                if (processName && isComposite && moduleName === node.declarations[0].id.name && isReactArrowFunctionComponent(node.declarations[0].init))
                {
                    Data.entry(relativePath, true).composite = createCompositeComponentDefinition(path, node.declarations[0].init);
                }
            },

            "ExportDefaultDeclaration" : function (path, state) {
                const { node } = path;
                const pluginOpts = state.opts;
                const relativePath = getRelativeModulePath(path, pluginOpts);

                const { appName, processName, moduleName, isComposite } = matchPath(relativePath);

                //console.log({ appName, processName, moduleName, isComposite });

                if (processName && isComposite)
                {
                    Data.entry(relativePath, true).export = TakeSource(node.declaration);
                }
            },


            "Program": function (path, state) {
                const { node } = path;
                const pluginOpts = state.opts;
                const relativePath = getRelativeModulePath(path, pluginOpts);

                const { appName, processName, moduleName, isComposite, isDomain, isQuery, isState } = matchPath(relativePath);


                if (isQuery)
                {
                    Data.entry(relativePath, true).query = createNamedQuery(relativePath, path)
                }

                //console.log({ appName, processName, moduleName, isComposite });

                if (isComposite)
                {
                    Data.entry(relativePath, true).extraConstants = getExtraConstants(relativePath, path, moduleName)
                }

                if (processName && !isComposite && processName === moduleName)
                {
                    Data.entry(relativePath, true).processExports = createProcessExports(relativePath, path)
                }
                else if (!processName && moduleName === "scopes")
                {
                    const scopes = createScopeDefinitions(relativePath, path, state);

                    Object.assign(
                        Data.entry(relativePath, true),
                        scopes
                    );
                }
                else if (!processName && isDomain)
                {
                    Data.entry(relativePath, true).domain = createDomainModel(relativePath, path, moduleName)
                }
                else if (processName && isState)
                {
                    const entry = Data.entry(relativePath, true);
                    entry.state = createStateModel(relativePath, path, moduleName)
                    entry.extraConstants = getExtraConstants(relativePath, path, moduleName)
                }
            }
        }
    };
};
