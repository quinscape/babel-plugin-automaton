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
            },
            "export": "SimpleComposite"
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

                },
                "export": "RenderFunctionChild"
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
                },
                "export": "BodylessRenderFunctionChild"
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
                },
                "export": "RenderFunctionAttr"
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
                                    "init": "this.props"
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
                                                "key": "formikProps",
                                                "value": {
                                                    "type": "Identifier",
                                                    "name": "formikProps"
                                                }
                                            }
                                        ]
                                    },
                                    "init": "formConfig"
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
                                                "key": "isValid",
                                                "value": {
                                                    "type": "Identifier",
                                                    "name": "isValid"
                                                }
                                            },
                                            {
                                                "type": "ObjectProperty",
                                                "key": "values",
                                                "value": {
                                                    "type": "Identifier",
                                                    "name": "values"
                                                }
                                            },
                                            {
                                                "type": "ObjectProperty",
                                                "key": "errors",
                                                "value": {
                                                    "type": "Identifier",
                                                    "name": "errors"
                                                }
                                            }
                                        ]
                                    },
                                    "init": "formikProps"
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
                                    "init": "authentication.id === values.ownerId || hasRole(\"ROLE_ADMIN\")"
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
                "export": "withForm(FormComposite, { type: \"FooInput\" })"
            }
        )
    });
});
