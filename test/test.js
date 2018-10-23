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
    return babel.transform(
        fs.readFileSync(
            path.join(__dirname, relPath)
        ),
        Object.assign(
            {},
            OPTIONS,
            {
                filename: relPath
            }
        )
    );
}

describe("Babel Automaton Plugin", function () {

    beforeEach(Data.clear);

    it("extracts simplified AST data from composite component sources", function () {
        transform("./test-modules/apps/test/processes/test/composites/SimpleComposite.js");

        assert.deepEqual(
            Data.entry("./apps/test/processes/test/composites/SimpleComposite"), {
            "importDeclarations": [
                {
                    "type": "ImportDeclaration",
                    "source": "react",
                    "specifiers": [
                        {
                            "type": "ImportDefaultSpecifier",
                            "name": "React"
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
        })

    });

    it("extracts render functions from React children", function () {
        // also contains multi-level object patterns

        transform("./test-modules/apps/test/processes/test/composites/RenderFunctionChild.js");

        const data = Data.entry("./apps/test/processes/test/composites/RenderFunctionChild");
        //console.log(JSON.stringify(data,0, 4))
        assert.deepEqual(
            data,
            {
                "importDeclarations": [
                    {
                        "type": "ImportDeclaration",
                        "source": "react",
                        "specifiers": [
                            {
                                "type": "ImportDefaultSpecifier",
                                "name": "React"
                            }
                        ]
                    },
                    {
                        "type": "ImportDeclaration",
                        "source": "../../components/ui",
                        "specifiers": [
                            {
                                "type": "ImportSpecifier",
                                "name": "Widget"
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
                                                            "value": {
                                                                "type": "Identifier",
                                                                "name": "length"
                                                            }
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
                                    {
                                        "type": "Identifier",
                                        "name": "context"
                                    }
                                ],
                                "constants": [
                                    {
                                        "type": "VariableDeclaration",
                                        "kind": "const",
                                        "declarations": [
                                            {
                                                "type": "VariableDeclarator",
                                                "id": {
                                                    "type": "Identifier",
                                                    "name": "uri"
                                                },
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

        transform("./test-modules/apps/test/processes/test/composites/BodylessRenderFunctionChild.js");

        const data = Data.entry("./apps/test/processes/test/composites/BodylessRenderFunctionChild");
        //console.log(JSON.stringify(data,0, 4))

        assert.deepEqual(
            data,
            {
                "importDeclarations": [
                    {
                        "type": "ImportDeclaration",
                        "source": "react",
                        "specifiers": [
                            {
                                "type": "ImportDefaultSpecifier",
                                "name": "React"
                            }
                        ]
                    },
                    {
                        "type": "ImportDeclaration",
                        "source": "../../components/ui",
                        "specifiers": [
                            {
                                "type": "ImportSpecifier",
                                "name": "Widget"
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
                                                            "value": {
                                                                "type": "Identifier",
                                                                "name": "length"
                                                            }
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
                                    {
                                        "type": "Identifier",
                                        "name": "context"
                                    }
                                ],
                                "constants": [],
                                "root": {
                                    "name": "em",
                                    "attrs": [],
                                    "kids": [
                                        {
                                            "type": "JSXExpressionContainer",
                                            "code": "{\"/xxx/\" + context + \"/\" + length}"
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

    it("extracts render function attributes from React children", function () {

        transform("./test-modules/apps/test/processes/test/composites/RenderFunctionAttr.js");

        const data = Data.entry("./apps/test/processes/test/composites/RenderFunctionAttr");
        //console.log(JSON.stringify(data,0, 4))

        assert.deepEqual(
            data,
            {
                "importDeclarations": [
                    {
                        "type": "ImportDeclaration",
                        "source": "react",
                        "specifiers": [
                            {
                                "type": "ImportDefaultSpecifier",
                                "name": "React"
                            }
                        ]
                    },
                    {
                        "type": "ImportDeclaration",
                        "source": "automaton-js",
                        "specifiers": [
                            {
                                "type": "ImportSpecifier",
                                "name": "i18n"
                            }
                        ]
                    },
                    {
                        "type": "ImportDeclaration",
                        "source": "../../components/ui",
                        "specifiers": [
                            {
                                "type": "ImportSpecifier",
                                "aliasOf": "Widget",
                                "name": "RenamedWidget"
                            },
                            {
                                "type": "ImportSpecifier",
                                "name": "Button"
                            }
                        ]
                    }
                ],
                "composite": {
                    "type": "CompositeComponent",
                    "constants": [],
                    "root": {
                        "name": "RenamedWidget",
                        "attrs": [
                            {
                                "type": "JSXAttribute",
                                "name": "toolbar",
                                "value": {
                                    "type": "JSXRenderFunction",
                                    "params": [
                                        {
                                            "type": "Identifier",
                                            "name": "context"
                                        }
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

        transform("./test-modules/apps/test/processes/test/test.js");
        const data = Data.entry("./apps/test/processes/test/test");

        //console.log(JSON.stringify(data,0, 4))

        assert.deepEqual(
            data,
            {
                "importDeclarations": [
                    {
                        "type": "ImportDeclaration",
                        "source": "mobx",
                        "specifiers": [
                            {
                                "type": "ImportSpecifier",
                                "name": "observable"
                            },
                            {
                                "type": "ImportSpecifier",
                                "name": "computed"
                            },
                            {
                                "type": "ImportSpecifier",
                                "name": "action"
                            }
                        ]
                    },
                    {
                        "type": "ImportDeclaration",
                        "source": "../components/CustomLayout",
                        "specifiers": [
                            {
                                "type": "ImportDefaultSpecifier",
                                "name": "CustomLayout"
                            }
                        ]
                    },
                    {
                        "type": "ImportDeclaration",
                        "source": "automaton-js",
                        "specifiers": [
                            {
                                "type": "ImportSpecifier",
                                "name": "injection"
                            },
                            {
                                "type": "ImportSpecifier",
                                "name": "type"
                            }
                        ]
                    }
                ],
                "processExports": {
                    "type": "ProcessExports",
                    "configuration": [
                        "/* process config /*\n",
                        "process.layout = CustomLayout",
                        "process.generalHelper(12)"
                    ],
                    "process": {
                        "startState": "CustomerList",
                        "states": {
                            "CustomerList": {
                                "to-detail": {
                                    "to": "CustomerDetail",
                                    "action": {
                                        "type": "Action",
                                        "params": [],
                                        "code": "scope.addTodo()"
                                    }
                                }
                            },
                            "CustomerDetail": {
                                "save": {
                                    "to": "CustomerList",
                                    "action": {
                                        "type": "Action",
                                        "params": [
                                            "t"
                                        ],
                                        "code": "{ process.back(); }"
                                    }
                                },
                                "cancel": {
                                    "to": "CustomerList"
                                }
                            }
                        }
                    },
                    "scope": {
                        "name": "TestScope",
                        "observables": [
                            {
                                "type": "PagedCustomer",
                                "name": "customers",
                                "defaultValue": "injection( // language=GraphQL\n`{\n                getCustomers{\n                    rows{\n                        id\n                        number\n                        salutation\n                        name\n                    }\n                }\n            }`)",
                                "description": "Current customers"
                            }
                        ],
                        "actions": [
                            {
                                "name": "updateCustomers",
                                "params": [
                                    "customers"
                                ],
                                "code": "this.customers = customers;"
                            }
                        ],
                        "computeds": [
                            {
                                "name": "rowCount",
                                "code": "return this.customers.rowCount;"
                            }
                        ],
                        "helpers": [
                            {
                                "name": "generalHelper",
                                "params": [
                                    "foo"
                                ],
                                "code": "return foo + 1;"
                            }
                        ]
                    }
                }
            }
        )

    });
});
