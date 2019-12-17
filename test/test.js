const assert = require("power-assert");
const babel = require("@babel/core");
const fs = require("fs");
const path = require("path");

const Data = require("../data");

const OPTIONS = {
    "presets": [
        "@babel/preset-react",
        "@babel/preset-env"
    ],

    "plugins" : [
            [
                require("../src/index")(babel),
                {
                    sourceRoot: "test-modules/",
                    "debug": true
                }
            ],
        ["@babel/plugin-proposal-class-properties", { "loose": true }],
        ["@babel/plugin-proposal-decorators", { "legacy": true }]
    ]
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

        const data = Data.entry("./apps/test/processes/test/composites/SimpleComposite");

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
                        "source": "mobx-react-lite",
                        "specifiers": [
                            {
                                "type": "ImportSpecifier",
                                "name": "fnObserver",
                                "aliasOf": "observer"
                            }
                        ]
                    }
                ],
                "extraConstants": [
                    "export const EXTRA = 1412, EX2 = 111;",
                    "export function test() { console.log(\"test\"); }",
                ],
                "composite": {
                    "type": "CompositeComponent",
                    "constants": [],
                    "root": {
                        "name": "div",
                        "attrs": [],
                        "kids": [
                            {
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
                                ],
                                "type": "JSXElement"
                            },
                            {
                                "name": "input",
                                "attrs": [
                                    {
                                        "type": "JSXAttribute",
                                        "name": "disabled",
                                        "value": null
                                    }
                                ],
                                "kids": [],
                                "type": "JSXElement"
                            }
                        ],
                        "type": "JSXElement"
                    }
                },
                "export": "fnObserver(SimpleComposite)"
            }
        )

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
                    },
                    {
                        "type": "ImportDeclaration",
                        "source": "mobx-react-lite",
                        "specifiers": [
                            {
                                "type": "ImportSpecifier",
                                "name": "fnObserver",
                                "aliasOf": "observer"
                            }
                        ]
                    }
                ],
                "extraConstants": [],
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
                                    "init": "props"
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
                },
                "export": "fnObserver(RenderFunctionChild)"
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
                    },
                    {
                        "type": "ImportDeclaration",
                        "source": "mobx-react-lite",
                        "specifiers": [
                            {
                                "type": "ImportSpecifier",
                                "name": "fnObserver",
                                "aliasOf": "observer"
                            }
                        ]
                    }
                ],
                "extraConstants": [],
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
                                    "init": "props"
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
                },
                "export": "fnObserver(BodylessRenderFunctionChild)"
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
                                "name": "RenamedWidget",
                                "aliasOf": "Widget"
                            },
                            {
                                "type": "ImportSpecifier",
                                "name": "Button"
                            }
                        ]
                    },
                    {
                        "type": "ImportDeclaration",
                        "source": "mobx-react-lite",
                        "specifiers": [
                            {
                                "type": "ImportSpecifier",
                                "name": "fnObserver",
                                "aliasOf": "observer"
                            }
                        ]
                    }
                ],
                "extraConstants": [],
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
                },
                "export": "fnObserver(RenderFunctionAttr)"
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
                        "source": "@quinscape/automaton-js",
                        "specifiers": [
                            {
                                "type": "ImportSpecifier",
                                "name": "injection"
                            },
                            {
                                "type": "ImportSpecifier",
                                "name": "type"
                            },
                            {
                                "type": "ImportSpecifier",
                                "name": "WorkingSet"
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
                        "startState": "\"CustomerList\"",
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
                                "code": "this.customers = customers;",
                                "bound": false
                            },
                            {
                                "name": "updateCustomers2",
                                "params": [
                                    "customers"
                                ],
                                "code": "this.customers = customers;",
                                "bound": true
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
                                "name": "workingSet",
                                "defaultValue": "new WorkingSet()",
                                "description": "Working set example"
                            },
                            {
                                "name": "generalHelper",
                                "params": [
                                    "foo"
                                ],
                                "code": "return foo + 1;"
                            }
                        ]
                    },
                    "extraConstants": []
                }
            }
        )
    });

    it("extracts exported HOC invocations", function () {

        transform("./test-modules/apps/test/processes/test/composites/FormComposite.js");

        const data = Data.entry("./apps/test/processes/test/composites/FormComposite");

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
                        "source": "mobx-react-lite",
                        "specifiers": [
                            {
                                "type": "ImportSpecifier",
                                "name": "fnObserver",
                                "aliasOf": "observer"
                            }
                        ]
                    },
                    {
                        "type": "ImportDeclaration",
                        "source": "classnames",
                        "specifiers": [
                            {
                                "type": "ImportDefaultSpecifier",
                                "name": "cx"
                            }
                        ]
                    },
                    {
                        "type": "ImportDeclaration",
                        "source": "domainql-form/lib/Field",
                        "specifiers": [
                            {
                                "type": "ImportDefaultSpecifier",
                                "name": "Field"
                            }
                        ]
                    },
                    {
                        "type": "ImportDeclaration",
                        "source": "domainql-form/lib/TextArea",
                        "specifiers": [
                            {
                                "type": "ImportDefaultSpecifier",
                                "name": "TextArea"
                            }
                        ]
                    },
                    {
                        "type": "ImportDeclaration",
                        "source": "domainql-form/lib/withForm",
                        "specifiers": [
                            {
                                "type": "ImportDefaultSpecifier",
                                "name": "withForm"
                            }
                        ]
                    },
                    {
                        "type": "ImportDeclaration",
                        "source": "domainql-form/lib/GlobalErrors",
                        "specifiers": [
                            {
                                "type": "ImportDefaultSpecifier",
                                "name": "GlobalErrors"
                            }
                        ]
                    },
                    {
                        "type": "ImportDeclaration",
                        "source": "../../components/Icon",
                        "specifiers": [
                            {
                                "type": "ImportDefaultSpecifier",
                                "name": "Icon"
                            }
                        ]
                    },
                    {
                        "type": "ImportDeclaration",
                        "source": "../../services/config",
                        "specifiers": [
                            {
                                "type": "ImportDefaultSpecifier",
                                "name": "config"
                            }
                        ]
                    },
                    {
                        "type": "ImportDeclaration",
                        "source": "../../util/hasRole",
                        "specifiers": [
                            {
                                "type": "ImportDefaultSpecifier",
                                "name": "hasRole"
                            }
                        ]
                    }
                ],
                "extraConstants": [],
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
                                                "key": "authentication",
                                                "value": {
                                                    "type": "Identifier",
                                                    "name": "authentication"
                                                }
                                            }
                                        ]
                                    },
                                    "init": "config()"
                                }
                            ]
                        },
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
                                                "key": "formConfig",
                                                "value": {
                                                    "type": "Identifier",
                                                    "name": "formConfig"
                                                }
                                            }
                                        ]
                                    },
                                    "init": "props"
                                }
                            ]
                        },
                        {
                            "type": "VariableDeclaration",
                            "kind": "const",
                            "declarations": [
                                {
                                    "type": "VariableDeclarator",
                                    "id": {
                                        "type": "Identifier",
                                        "name": "canAccess"
                                    },
                                    "init": "authentication.id === formConfig.root.ownerId || hasRole(\"ROLE_ADMIN\")"
                                }
                            ]
                        }
                    ],
                    "root": {
                        "name": "React.Fragment",
                        "attrs": [],
                        "kids": [
                            {
                                "name": "GlobalErrors",
                                "attrs": [],
                                "kids": [],
                                "type": "JSXElement"
                            },
                            {
                                "name": "Field",
                                "attrs": [
                                    {
                                        "type": "JSXAttribute",
                                        "name": "name",
                                        "value": {
                                            "type": "Expression",
                                            "code": "\"name\""
                                        }
                                    }
                                ],
                                "kids": [],
                                "type": "JSXElement"
                            },
                            {
                                "name": "TextArea",
                                "attrs": [
                                    {
                                        "type": "JSXAttribute",
                                        "name": "name",
                                        "value": {
                                            "type": "Expression",
                                            "code": "\"description\""
                                        }
                                    }
                                ],
                                "kids": [],
                                "type": "JSXElement"
                            },
                            {
                                "name": "Field",
                                "attrs": [
                                    {
                                        "type": "JSXAttribute",
                                        "name": "name",
                                        "value": {
                                            "type": "Expression",
                                            "code": "\"num\""
                                        }
                                    }
                                ],
                                "kids": [],
                                "type": "JSXElement"
                            },
                            {
                                "name": "div",
                                "attrs": [],
                                "kids": [
                                    {
                                        "name": "button",
                                        "attrs": [
                                            {
                                                "type": "JSXAttribute",
                                                "name": "type",
                                                "value": {
                                                    "type": "Expression",
                                                    "code": "\"reset\""
                                                }
                                            },
                                            {
                                                "type": "JSXAttribute",
                                                "name": "className",
                                                "value": {
                                                    "type": "Expression",
                                                    "code": "\"btn btn-secondary\""
                                                }
                                            }
                                        ],
                                        "kids": [
                                            {
                                                "name": "Icon",
                                                "attrs": [
                                                    {
                                                        "type": "JSXAttribute",
                                                        "name": "className",
                                                        "value": {
                                                            "type": "Expression",
                                                            "code": "\"fa-recycle\""
                                                        }
                                                    }
                                                ],
                                                "kids": [],
                                                "type": "JSXElement"
                                            },
                                            {
                                                "type": "JSXExpressionContainer",
                                                "code": "{\" \"}"
                                            },
                                            {
                                                "type": "JSXText",
                                                "value": "Reset"
                                            }
                                        ],
                                        "type": "JSXElement"
                                    },
                                    {
                                        "type": "JSXExpressionContainer",
                                        "code": "{\" \"}"
                                    },
                                    {
                                        "name": "button",
                                        "attrs": [
                                            {
                                                "type": "JSXAttribute",
                                                "name": "type",
                                                "value": {
                                                    "type": "Expression",
                                                    "code": "\"submit\""
                                                }
                                            },
                                            {
                                                "type": "JSXAttribute",
                                                "name": "className",
                                                "value": {
                                                    "type": "JSXExpressionContainer",
                                                    "code": "{cx(\"btn\", canAccess ? \"btn-success\" : \"btn-danger\")}"
                                                }
                                            }
                                        ],
                                        "kids": [
                                            {
                                                "name": "Icon",
                                                "attrs": [
                                                    {
                                                        "type": "JSXAttribute",
                                                        "name": "className",
                                                        "value": {
                                                            "type": "Expression",
                                                            "code": "\"fa-save\""
                                                        }
                                                    }
                                                ],
                                                "kids": [],
                                                "type": "JSXElement"
                                            },
                                            {
                                                "type": "JSXExpressionContainer",
                                                "code": "{\" \"}"
                                            },
                                            {
                                                "type": "JSXText",
                                                "value": "Save"
                                            }
                                        ],
                                        "type": "JSXElement"
                                    }
                                ],
                                "type": "JSXElement"
                            }
                        ],
                        "type": "JSXElement"
                    }
                },
                "export": "withForm(fnObserver(FormComposite), { type: \"FooInput\" })"
            }
        )
    });

    it("extracts conditional components to renderedIf attributes", function () {

        transform("./test-modules/apps/test/processes/test/composites/ConditionalComponent.js");

        const data = Data.entry("./apps/test/processes/test/composites/ConditionalComponent");

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
                        "source": "mobx-react-lite",
                        "specifiers": [
                            {
                                "type": "ImportSpecifier",
                                "name": "fnObserver",
                                "aliasOf": "observer"
                            }
                        ]
                    }
                ],
                "extraConstants": [],
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
                                                                "name": "cp"
                                                            }
                                                        }
                                                    ]
                                                }
                                            }
                                        ]
                                    },
                                    "init": "props"
                                }
                            ]
                        }
                    ],
                    "root": {
                        "name": "div",
                        "attrs": [],
                        "kids": [
                            {
                                "name": "h1",
                                "attrs": [
                                    {
                                        "type": "JSXAttribute",
                                        "name": "renderedIf",
                                        "value": {
                                            "type": "Expression",
                                            "code": "cp === \"/foo\" || cp === \"\""
                                        }
                                    }
                                ],
                                "kids": [
                                    {
                                        "type": "JSXText",
                                        "value": "ConditionalComponent"
                                    }
                                ],
                                "type": "JSXElement"
                            }
                        ],
                        "type": "JSXElement"
                    }
                },
                "export": "fnObserver(ConditionalComponent)"
            }
        )
    });

    it("extracts global scope definitions", function () {

        transform("./test-modules/apps/test/scopes.js");

        const data = Data.entry("./apps/test/scopes");

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
                                "name": "action"
                            },
                            {
                                "type": "ImportSpecifier",
                                "name": "observable"
                            }
                        ]
                    },
                    {
                        "type": "ImportDeclaration",
                        "source": "automaton-js",
                        "specifiers": [
                            {
                                "type": "ImportSpecifier",
                                "name": "type"
                            }
                        ]
                    }
                ],
                "applicationScope": {
                    "name": "ApplicationScope",
                    "observables": [
                        {
                            "name": "configValue",
                            "defaultValue": "\"\"",
                            "description": null
                        }
                    ],
                    "actions": [
                        {
                            "name": "appScopeAction",
                            "params": [
                                "s"
                            ],
                            "code": "this.configValue = s;",
                            "bound": false
                        }
                    ],
                    "computeds": [],
                    "helpers": []
                },
                "userScope": {
                    "name": "UserScope",
                    "observables": [
                        {
                            "name": "configValue",
                            "defaultValue": "1283",
                            "description": null
                        }
                    ],
                    "actions": [
                        {
                            "name": "userScopeAction",
                            "params": [
                                "n"
                            ],
                            "code": "this.configValue = n;",
                            "bound": false
                        }
                    ],
                    "computeds": [],
                    "helpers": []
                },
                "sessionScope": {
                    "name": "SessionScope",
                    "observables": [
                        {
                            "name": "configValue",
                            "defaultValue": "false",
                            "description": null
                        }
                    ],
                    "actions": [
                        {
                            "name": "userScopeAction",
                            "params": [
                                "f"
                            ],
                            "code": "this.configValue = f;",
                            "bound": false
                        }
                    ],
                    "computeds": [],
                    "helpers": []
                }
            }
        )
    });

    it("extracts start transitions", function () {

        transform("./test-modules/apps/test/processes/start-transition/start-transition.js");

        const data = Data.entry("./apps/test/processes/start-transition/start-transition");

        //console.log(JSON.stringify(data,0, 4))

        assert.deepEqual(
            data,
            {
                "importDeclarations": [
                    {
                        "type": "ImportDeclaration",
                        "source": "automaton-js",
                        "specifiers": [
                            {
                                "type": "ImportSpecifier",
                                "name": "Process"
                            }
                        ]
                    }
                ],
                "processExports": {
                    "type": "ProcessExports",
                    "configuration": [],
                    "process": {
                        "startState": "t => { const { target } = process.input; t.target = target && \"Target\" + target.toUpperCase() || \"Home\"; }",
                        "states": {
                            "Home": {},
                            "TargetA": {
                                "back": {
                                    "to": "Home"
                                }
                            },
                            "TargetB": {
                                "back": {
                                    "to": "Home"
                                }
                            },
                            "TargetC": {
                                "back": {
                                    "to": "Home"
                                }
                            }
                        }
                    },
                    "scope": null,
                    "extraConstants": []
                }
            }

        )
    });

    it("extracts extra constants out of process modules", function () {

        transform("./test-modules/apps/test/processes/extra-constants/extra-constants.js");

        const data = Data.entry("./apps/test/processes/extra-constants/extra-constants");

        //console.log(JSON.stringify(data,0, 4))

        assert.deepEqual(
            data,
            {
                "importDeclarations": [
                    {
                        "type": "ImportDeclaration",
                        "source": "automaton-js",
                        "specifiers": [
                            {
                                "type": "ImportSpecifier",
                                "name": "Process"
                            }
                        ]
                    }
                ],
                "processExports": {
                    "type": "ProcessExports",
                    "configuration": [],
                    "process": {
                        "startState": "\"Home\"",
                        "states": {
                            "Home": {}
                        }
                    },
                    "scope": null,
                    "extraConstants": [
                        "export const EXPORTED_CONSTANT = 123456;",
                        "export function exportedFn() {}",
                        "const CONSTANT = \"Quux\";",
                        "function extraFn() {}"
                    ]
                }
            }        )
    });

    it("extracts domain models", function () {

        transform("./test-modules/apps/test/domain/Foo.js");

        const data = Data.entry("./apps/test/domain/Foo");

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
                        "source": "automaton-js",
                        "specifiers": [
                            {
                                "type": "ImportSpecifier",
                                "name": "injection"
                            }
                        ]
                    }
                ],
                "domain": {
                    "name": "Foo",
                    "observables": [
                        {
                            "name": "id",
                            "defaultValue": null,
                            "description": null
                        },
                        {
                            "name": "name",
                            "defaultValue": null,
                            "description": null
                        },
                        {
                            "name": "created",
                            "defaultValue": null,
                            "description": null
                        },
                        {
                            "name": "num",
                            "defaultValue": null,
                            "description": null
                        },
                        {
                            "name": "description",
                            "defaultValue": null,
                            "description": null
                        },
                        {
                            "name": "type",
                            "defaultValue": null,
                            "description": null
                        },
                        {
                            "name": "owner",
                            "defaultValue": null,
                            "description": null
                        }
                    ],
                    "actions": [],
                    "computeds": [
                        {
                            "name": "short",
                            "code": "return this.name + \":\" + this.num + \":\" + this.type;"
                        }
                    ],
                    "helpers": []
                }
            }
        )
    });
    
    it("detects wrongly named domain models", function () {

        assert.throws(
            () => transform("./test-modules/apps/test/domain/Bar.js"),
            /Domain model must be named the same as the module: is 'WrongName', should be 'Bar'/
        );

    });


    it("supports discard and confirmation on transitions", function () {

        transform("./test-modules/apps/test/processes/transition-control/transition-control.js");

        const data = Data.entry("./apps/test/processes/transition-control/transition-control");

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
                    "configuration": [],
                    "process": {
                        "startState": "\"FooList\"",
                        "states": {
                            "FooList": {
                                "delete": {
                                    "discard": true,
                                    "confirmation": {
                                        "type": "Action",
                                        "params": [
                                            "ctx"
                                        ],
                                        "code": "`Delete ${ctx.name} ?`"
                                    },
                                    "to": "FooList",
                                    "action": {
                                        "type": "Action",
                                        "params": [],
                                        "code": "scope.addTodo()"
                                    }
                                },
                                "cancel": {
                                    "discard": true,
                                    "to": "FooList",
                                    "action": {
                                        "type": "Action",
                                        "params": [],
                                        "code": "scope.addTodo()"
                                    }
                                }
                            }
                        }
                    },
                    "scope": {
                        "name": "TestScope",
                        "observables": [],
                        "actions": [
                            {
                                "name": "addToDo",
                                "params": [
                                    "ctx"
                                ],
                                "code": "",
                                "bound": false
                            }
                        ],
                        "computeds": [],
                        "helpers": []
                    },
                    "extraConstants": []
                }
            }
        )
    });

    // Additional test for array destructing since we first left that out and introduced it later for hooks

    it("supports array destructing in composites", function () {

        transform("./test-modules/apps/test/processes/test/composites/ArrayDestructingConstant.js");

        const data = Data.entry("./apps/test/processes/test/composites/ArrayDestructingConstant");

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
                            },
                            {
                                "type": "ImportSpecifier",
                                "name": "useState"
                            }
                        ]
                    },
                    {
                        "type": "ImportDeclaration",
                        "source": "classnames",
                        "specifiers": [
                            {
                                "type": "ImportDefaultSpecifier",
                                "name": "cx"
                            }
                        ]
                    },
                    {
                        "type": "ImportDeclaration",
                        "source": "mobx-react-lite",
                        "specifiers": [
                            {
                                "type": "ImportSpecifier",
                                "name": "fnObserver",
                                "aliasOf": "observer"
                            }
                        ]
                    }
                ],
                "extraConstants": [],
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
                                        "type": "ArrayPattern",
                                        "elements": [
                                            {
                                                "type": "Identifier",
                                                "name": "flag"
                                            },
                                            {
                                                "type": "Identifier",
                                                "name": "setFlag"
                                            }
                                        ]
                                    },
                                    "init": "useState(false)"
                                }
                            ]
                        },
                        {
                            "type": "VariableDeclaration",
                            "kind": "const",
                            "declarations": [
                                {
                                    "type": "VariableDeclarator",
                                    "id": {
                                        "type": "ArrayPattern",
                                        "elements": [
                                            {
                                                "type": "Identifier",
                                                "name": "a"
                                            },
                                            {
                                                "type": "ObjectPattern",
                                                "properties": [
                                                    {
                                                        "type": "ObjectProperty",
                                                        "key": "b",
                                                        "value": {
                                                            "type": "Identifier",
                                                            "name": "c"
                                                        }
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    "init": "props"
                                }
                            ]
                        }
                    ],
                    "root": {
                        "name": "div",
                        "attrs": [],
                        "kids": [
                            {
                                "name": "button",
                                "attrs": [
                                    {
                                        "type": "JSXAttribute",
                                        "name": "className",
                                        "value": {
                                            "type": "JSXExpressionContainer",
                                            "code": "{cx(\"btn\", flag ? \"btn-success\" : \"btn-danger\")}"
                                        }
                                    },
                                    {
                                        "type": "JSXAttribute",
                                        "name": "onClick",
                                        "value": {
                                            "type": "JSXExpressionContainer",
                                            "code": "{() => setFlag(!flag)}"
                                        }
                                    }
                                ],
                                "kids": [
                                    {
                                        "type": "JSXText",
                                        "value": "ArrayDestructingConstant"
                                    }
                                ],
                                "type": "JSXElement"
                            }
                        ],
                        "type": "JSXElement"
                    }
                },
                "export": "fnObserver(ArrayDestructingConstant)"
            }
        )
    });

    it("extracts named queries", function () {

        transform("./test-modules/apps/test/queries/Q_AppQuery.js");

        const data = Data.entry("./apps/test/queries/Q_AppQuery");

        //console.log(JSON.stringify(data,0, 4))

        assert.deepEqual(
            data,
            {
                "importDeclarations": [
                    {
                        "type": "ImportDeclaration",
                        "source": "@quinscape/automaton-js",
                        "specifiers": [
                            {
                                "type": "ImportSpecifier",
                                "name": "query"
                            }
                        ]
                    }
                ],
                "query": {
                    "query": "\n        query myQuery($id: String!)\n        {\n            myQuery(id: $id)\n            {\n                name\n                value\n            }\n        }",
                    "variables": {
                        "id": "130521f7-bca8-4e4f-a1b6-8a25b4730f01"
                    }
                }
            }
        )

        transform("./test-modules/apps/test/processes/test/queries/Q_ProcessQuery.js");

        const data2 = Data.entry("./apps/test/processes/test/queries/Q_ProcessQuery");

        //console.log(JSON.stringify(data2,0, 4))

        assert.deepEqual(
            data2,
            {
                "importDeclarations": [
                    {
                        "type": "ImportDeclaration",
                        "source": "@quinscape/automaton-js",
                        "specifiers": [
                            {
                                "type": "ImportSpecifier",
                                "name": "query"
                            }
                        ]
                    }
                ],
                "query": {
                    "query": "\n        query myOtherQuery($id: String!)\n        {\n            myOtherQuery(id: $id)\n            {\n                name\n                value\n            }\n        }",
                    "variables": {
                        "id": "27af1ea6-60d7-423c-849e-d56c1e6983a5"
                    }
                }
            }
        )
    });
});
