const assert = require("power-assert");
const babel = require("babel-core");
const fs = require("fs");
const path = require("path");

const Data = require("../data");

const OPTIONS = {

    presets: [
        "babel-preset-es2015",
        "babel-preset-react",
        "babel-preset-stage-1"

    ],
    plugins: [
        [
            require("../src/index")(babel),
            {
                "debug": false
            }
        ],
        "transform-decorators-legacy"
    ],
    sourceRoot: "./test-modules/"
};

function transform(relPath)
{
    return babel.transform(fs.readFileSync(path.join(__dirname, relPath)), Object.assign({}, OPTIONS, {
        filename: relPath
    }));
}

describe("Babel Automaton Plugin", function () {
    beforeEach(function () {
        Data.clear();
    });

    it("extracts simplified AST data from composite component sources", function () {
        transform("./test-modules/apps/test/composites/SimpleComposite.js");

        const data = Data.get();

        assert.deepEqual(data, {
            "./apps/test/composites/SimpleComposite": {
                "importDeclarations": [
                    {
                        "type": "ImportDeclaration",
                        "source": "react",
                        "specifiers": [
                            {
                                "type": "ImportDefaultSpecifier",
                                "local": "React"
                            }
                        ]
                    }
                ],
                "composite": {
                    "type": "CompositeComponent",
                    "constants": [],
                    "root": {
                        "type": "JSXElement",
                        "name": "div",
                        "attrs": [],
                        "kids": [
                            {
                                "type": "JSXElement",
                                "name": "h1",
                                "attrs": [
                                    {
                                        "type": "JSXAttribute",
                                        "name": "className",
                                        "value": {
                                            "type": "Expression",
                                            "code": "\"test-class\""
                                        }
                                    }
                                ],
                                "kids": [
                                    {
                                        "type": "JSXText",
                                        "value": "SimpleComposite"
                                    }
                                ]
                            }
                        ]
                    }
                }
            }
        })

    });

    it("extracts render functions from React children", function () {
        // also contains multi-level object patterns

        transform("./test-modules/apps/test/composites/RenderFunctionChild.js");
        const data = Data.get();

        //console.log(JSON.stringify(data,0, 4))

        assert.deepEqual(
            data["./apps/test/composites/RenderFunctionChild"],
            {
                "importDeclarations": [
                    {
                        "type": "ImportDeclaration",
                        "source": "react",
                        "specifiers": [
                            {
                                "type": "ImportDefaultSpecifier",
                                "local": "React"
                            }
                        ]
                    },
                    {
                        "type": "ImportDeclaration",
                        "source": "../../components/ui",
                        "specifiers": [
                            {
                                "type": "ImportSpecifier",
                                "imported": "Widget",
                                "local": "Widget"
                            }
                        ]
                    }
                ],
                "composite": {
                    "type": "CompositeComponent",
                    "constants": [
                        {
                            "type": "VariableDeclaration",
                            "kind": "const",
                            "declarations": [
                                // multi-level object patterns
                                {
                                    "type": "VariableDeclarator",
                                    "id": {
                                        "type": "ObjectPattern",
                                        "properties": [
                                            {
                                                "type": "ObjectProperty",
                                                "key": "env",
                                                "value": {
                                                    "type": "ObjectPattern",
                                                    "properties": [
                                                        {
                                                            "type": "ObjectProperty",
                                                            "key": "contextPath",
                                                            "value": "length"
                                                        }
                                                    ]
                                                }
                                            }
                                        ]
                                    },
                                    "init": "this.props"
                                }
                            ]
                        }
                    ],
                    "root": {
                        "name": "Widget",
                        "attrs": [],
                        "kids": [
                            {
                                "type": "JSXRenderFunction",
                                "params": [
                                    "context"
                                ],
                                "constants": [
                                    {
                                        "type": "VariableDeclaration",
                                        "kind": "const",
                                        "declarations": [
                                            {
                                                "type": "VariableDeclarator",
                                                "id": "uri",
                                                "init": "\"/xxx/\" + context + \"/\" + length"
                                            }
                                        ]
                                    }
                                ],
                                "root": {
                                    "name": "em",
                                    "attrs": [],
                                    "kids": [
                                        {
                                            "type": "JSXExpressionContainer",
                                            "code": "{uri}"
                                        }
                                    ],
                                    "type": "JSXElement"
                                }
                            }
                        ],
                        "type": "JSXElement"
                    }
                }
            }
        )

    });

    it("extracts bodyless render functions from React children", function () {
        // also contains multi-level object patterns

        transform("./test-modules/apps/test/composites/BodylessRenderFunctionChild.js");
        const data = Data.get();

        //console.log(JSON.stringify(data,0, 4))

        assert.deepEqual(
            data["./apps/test/composites/BodylessRenderFunctionChild"],
            {
                "importDeclarations": [
                    {
                        "type": "ImportDeclaration",
                        "source": "react",
                        "specifiers": [
                            {
                                "type": "ImportDefaultSpecifier",
                                "local": "React"
                            }
                        ]
                    },
                    {
                        "type": "ImportDeclaration",
                        "source": "../../components/ui",
                        "specifiers": [
                            {
                                "type": "ImportSpecifier",
                                "imported": "Widget",
                                "local": "Widget"
                            }
                        ]
                    }
                ],
                "composite": {
                    "type": "CompositeComponent",
                    "constants": [
                        {
                            "type": "VariableDeclaration",
                            "kind": "const",
                            "declarations": [
                                // multi-level object patterns
                                {
                                    "type": "VariableDeclarator",
                                    "id": {
                                        "type": "ObjectPattern",
                                        "properties": [
                                            {
                                                "type": "ObjectProperty",
                                                "key": "env",
                                                "value": {
                                                    "type": "ObjectPattern",
                                                    "properties": [
                                                        {
                                                            "type": "ObjectProperty",
                                                            "key": "contextPath",
                                                            "value": "length"
                                                        }
                                                    ]
                                                }
                                            }
                                        ]
                                    },
                                    "init": "this.props"
                                }
                            ]
                        }
                    ],
                    "root": {
                        "name": "Widget",
                        "attrs": [],
                        "kids": [
                            {
                                "type": "JSXRenderFunction",
                                "constants": [],
                                "params": [
                                    "context"
                                ],
                                "root": {
                                    "attrs": [],
                                    "kids": [
                                        {
                                            "code": "{\"/xxx/\" + context + \"/\" + length}",
                                            "type": "JSXExpressionContainer"
                                        }
                                    ],
                                    "name": "em",
                                    "type": "JSXElement"
                                }
                            }
                        ],
                        "type": "JSXElement"
                    }
                }
            }
        )

    });

    it("extracts render function attributes from React children", function () {

        transform("./test-modules/apps/test/composites/RenderFunctionAttr.js");
        const data = Data.get();

        //console.log(JSON.stringify(data,0, 4))

        assert.deepEqual(
            data["./apps/test/composites/RenderFunctionAttr"],
            {
                "importDeclarations": [
                    {
                        "type": "ImportDeclaration",
                        "source": "react",
                        "specifiers": [
                            {
                                "type": "ImportDefaultSpecifier",
                                "local": "React"
                            }
                        ]
                    },
                    {
                        "type": "ImportDeclaration",
                        "source": "automaton-js",
                        "specifiers": [
                            {
                                "type": "ImportSpecifier",
                                "imported": "i18n",
                                "local": "i18n"
                            }
                        ]
                    },
                    {
                        "type": "ImportDeclaration",
                        "source": "../../components/ui",
                        "specifiers": [
                            {
                                "type": "ImportSpecifier",
                                "imported": "Widget",
                                "local": "Widget"
                            },
                            {
                                "type": "ImportSpecifier",
                                "imported": "Button",
                                "local": "Button"
                            }
                        ]
                    }
                ],
                "composite": {
                    "type": "CompositeComponent",
                    "constants": [],
                    "root": {
                        "name": "Widget",
                        "attrs": [
                            {
                                "type": "JSXAttribute",
                                "name": "toolbar",
                                "value": {
                                    "type": "JSXRenderFunction",
                                    "params": [
                                        "context"
                                    ],
                                    "constants": [],
                                    "root": {
                                        "name": "div",
                                        "attrs": [],
                                        "kids": [
                                            {
                                                "name": "Button",
                                                "attrs": [
                                                    {
                                                        "type": "JSXAttribute",
                                                        "name": "transition",
                                                        "value": {
                                                            "type": "Expression",
                                                            "code": "\"do-stuff\""
                                                        }
                                                    },
                                                    {
                                                        "type": "JSXAttribute",
                                                        "name": "text",
                                                        "value": {
                                                            "type": "JSXExpressionContainer",
                                                            "code": "{i18n(\"Do Stuff\", context)}"
                                                        }
                                                    }
                                                ],
                                                "kids": [],
                                                "type": "JSXElement"
                                            }
                                        ],
                                        "type": "JSXElement"
                                    }
                                }
                            }
                        ],
                        "kids": [],
                        "type": "JSXElement"
                    }
                }
            }
        )
    });

    it("extracts process definitions", function () {

        transform("./test-modules/apps/test/test.js");
        const data = Data.get();


        console.log(JSON.stringify(data,0, 4))

    });
});
