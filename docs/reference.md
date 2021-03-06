# JSON reference

## Imports

All js based models contain the same JSON block that records the imports
in that module.

We support all syntax forms of ES6 imports

```js
import React from "react"
import { Original as Widget } from "../../components/ui"
import * as Another from "another-lib"
```

which will be turned into the following json block ( `"..." : true` symbolizing the missing type specific JSON data. )

```json
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
                    "name": "Widget",
                    "aliasOf": "Original"
                }
            ]
        },
        {
            "type": "ImportDeclaration",
            "source": "another-lib",
            "specifiers": [
                {
                    "type": "ImportNamespaceSpecifier",
                    "name": "Another"
                }
            ]
        }
    ],
    
    "..." : true
}
```

In case there is no `Original as` clause in the second use case, the `"aliasOf"` property will be missing and it is thus
a signal to render that clause on the way back.

## Composite Components

Here we see the JavaScript source for a simple composite component. 

```js
// noinspection NpmUsedModulesInstalled
import React from "react"

import { observer as fnObserver } from "mobx-react-lite"

const SimpleComposite = props => {
    return (
        <div>
            <h1 className="test-class">SimpleComposite</h1>
        </div>
    )
}

export default fnObserver(SimpleComposite)
```
Composite components contain two more properties in addition to `"importDeclarations"`

```json
{
    "importDeclarations": [ "..." ],
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
                }
            ],
            "type": "JSXElement"
        }
    },
    "export": "fnObserver(SimpleComposite)"
}
```
Composite components contain two more properties in addition to `"importDeclarations"`

The `"composite"` property contains actual composite component definition and the `"export"` key containing the source 
of the export declaration including all applied HOCs.

### Composite

The `"composite"` in turns contains two properties `"constants"` which we will explain below and the `"root"` property 
which contains a recursive structure of `"JSXElement"` typed objects.

Each has an `"attrs` key containing an array of `"JSXAttribute"` typed objects that have a `"name"` attribute with the attribute name 
and a `"value"` attribute that is either an "`Expression`" with a literal code `"code"` property or a `"RenderFunction"` object.

The `"kids"` property contains an array of further elements that can be either

 * `"JSXText"`typed with `"value"` string property
 * `"JSXExpressionContainer"`typed with literal `"code"` property
 * `"RenderFunction"` typed
 * and an `"JSXElement"` 


The `"decorators"` property contains a list of all decorators applied to the composite component. Each decorator
has a `"name"` property and potentially an `"arguments"` array with the source of all arguments. 

### Render Functions

Here we see a composite component demonstrating two advanced features: Render functions and constant declarations with
object patterns.

```js
import React from "react"
import { Widget } from "../../components/ui"

import { observer as fnObserver } from "mobx-react-lite"

const RenderFunctionChild = props => {

    const { env : { contextPath : length } } = props;

    return (
        <Widget>
            {
                context => {

                    const uri = "/xxx/" + context + "/" + length;

                    return (
                        <em>
                            {
                                uri
                            }
                        </em>
                    )
                }
            }
        </Widget>
    )
}

export default fnObserver(RenderFunctionChild)
```

Here's the JSON of that with the first complex constant left out

```json
{
    "importDeclarations": [ "..." ],
    "composite": {
        "type": "CompositeComponent",
        "constants": [
            {
                "type": "VariableDeclaration",
                "kind": "const",
                "declarations": [
                    "... left out ..."
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
```

The widget has a `"RenderFunction"` typed child which contains a `"params` array listing the arguments the 
render function accepts as a `"constants"` array with the normalish constant declaration for `uri`:

```js
    const uri = "/xxx/" + context + "/" + length;
```

```json
{
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
    ]
}
```

Each constant entry is a `"VariableDeclaration"` typed object with a `"kind` property containing either `"let"` or `"const"`.

Each `"VariableDeclaration"` can contain multiple `"VariableDeclarator"` that in the most simple case have an `"id"` property
with an `"Identifier"` typed object that has a `"name"` property.

### ObjectPattern / ArrayPattern

We are purposefully only supporting only a specific subset of all possible ECMAScript and React constructs but we want 
to support all of the constructs that we do support.

This gives us the same additional complication in two places: constant declarations and render function parameters.

Both can use arbitrarily complex destructuring.

Let's take a look at the complex example we left out above 

```js
    const { env : { contextPath : length } } = props;
```

This is an actually working but admittedly somewhat contrived example executing the following equivalent code.

```js
    const length = props.env.contextPath.length;
```

The resulting JSON forms another recursive structure

```json
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
```

We first did not support ArrayPattern but its ubiquity in hooks changed that so now

```js
    const [ a, { b: c} ] = props;
```

is transformed into

```json
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
```



The `"id` property of the `"VariableDeclarator"` starts out with an `"ObjectPattern"` or `"ArrayPattern"` type that contains multiple
`"ObjectProperty"` type properties whose `"value"` property either contains another `"ObjectPattern"`, `"ArrayPattern"` or closes
off the chain with an `"Identifier"`

The same recursive "object/array pattern or identifier" thing happens for elements of the `"params"` array of the render function.
 
## Process Exports

```js
import {
    observable,
    computed,
    action
} from "mobx";

import CustomLayout from "../components/CustomLayout"
import CustomerList from "./states/CustomerList"

import {
    injection,
    type
} from "automaton-js";

// noinspection JSUnusedGlobalSymbols
export function initProcess(process, scope)
{
    // process config
    process.layout = CustomLayout;
    process.generalHelper(12);

    // start with customer list
    return CustomerList;
}

export default class TestScope {

    /* Current customers */
    @observable customers = injection(
        // language=GraphQL
        `{
                getCustomers{
                    rows{
                        id
                        number
                        salutation
                        name
                    }
                }
            }`
    );

    @action
    updateCustomers(customers)
    {
        this.customers = customers;
    }

    @action.bound
    updateCustomers2(customers)
    {
        this.customers = customers;
    }

    @computed
    get rowCount()
    {
        return this.customers.rowCount;
    }

    generalHelper(foo)
    {
        return foo + 1;
    }

}
```

The above results in the following JSON

```json
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
            "source": "./states/CustomerList",
            "specifiers": [
                {
                    "type": "ImportDefaultSpecifier",
                    "name": "CustomerList"
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
        "init": [
            "// start with customer list\nreturn CustomerList;"
        ],
        "startState": "CustomerList",
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
```

In addition to the imports the we have a `"processExports"` object. 

It has a `"configuration"` array which contains the code and the comments of all scope and process related configuration.
(In detail that means that we accept any assignment expression or method call that refers to process or scope including its
leading comments).

The former `"process"` property is gone.

For constant start states, the `"startState"` property contains the name of the startState, otherwise null.

The `"init"` array collects the actual start state initialization code that is not configuration statements.

The `"scope"` property contains a `"name"` property and four array properties containing the collected member types.

The `"extraConstants"` property contains an array of extra definitions for the process. These can be constants and
functions, exported or not.

### observables
name          | description
--------------|------------  
name          | name of the @observable
defaultValue  | code of the default value
description   | description text


### actions
name          | description
--------------|------------  
name          | name of the @action
params        | Array of action arguments
code          | action code


### computeds
name          | description
--------------|------------  
name          | name of the @computed
code          | computer getter code


### helpers

Now exist as either a helper method or a helper property

#### Helper Method

name          | description
--------------|------------  
name          | name of the helper
params        | Array of helper arguments
code          | helper code

#### Helper Property

name          | description
--------------|------------  
name          | name of the helper property
defaultValue  | code of the default value
description   | description text

## Named Queries

Named queries must be in a "queries" folder either directly in the app root or in one of the processes

    ./apps/myApp/queries/Q_AppLevelQuery.js
    ./apps/myApp/processes/myProcess/queries/Q_AppLevelQuery.js

A query module 

```js
export default query(
    // language=GraphQL
        `
        query myOtherQuery($id: String!)
        {
            myOtherQuery(id: $id)
            {
                name
                value
            }
        }`,
    {
        "id": "27af1ea6-60d7-423c-849e-d56c1e6983a5"
    }
)
```
is extracted as the following JSON

```json
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
        "query": "\n        query myOtherQuery($id: String!)\n ...",
        "variables": {
            "id": "27af1ea6-60d7-423c-849e-d56c1e6983a5"
        }
    }
}
```

The `query` property of the export is a static evaluation of the query() method arguments. 

## View States 

The process v2 structure introduces the view states as standalone files

 ```js
import React from "react";
import { ViewState } from "@quinscape/automaton-js";

import FooDetail from "./states/FooDetail";

const extra = 1234;

const FooList = new ViewState(
    "FooList",
    (process, scope) => ({
            "delete":
                {
                    discard: true,
                    confirmation: ctx => (`Delete ${ctx.name} ?`),
                    to: FooList,
                    action: t => scope.addTodo(t.context)
                },
            "cancel":
                {
                    discard: true,
                    to: FooList,
                    action: t => scope.addTodo(t.context)
                },
            "detail":
                {
                    to: FooDetail,
                    action: t => scope.setCurrent(t.context)
                }
        }
    ),
    props => {

        const { env } = props;
        const { scope } = env;

        return (
            <div>
                <h1>FooList</h1>
                {
                    scope.foos.length
                }
            </div>
        );
    }
);

export default FooList;
```

The view state will be transformed into the following JSON

```json
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
            "source": "@quinscape/automaton-js",
            "specifiers": [
                {
                    "type": "ImportSpecifier",
                    "name": "ViewState"
                }
            ]
        },
        {
            "type": "ImportDeclaration",
            "source": "./states/FooDetail",
            "specifiers": [
                {
                    "type": "ImportDefaultSpecifier",
                    "name": "FooDetail"
                }
            ]
        }
    ],
    "state": {
        "type": "ViewState",
        "name": "FooList",
        "transitionMap": {
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
                    "params": [
                        "t"
                    ],
                    "code": "scope.addTodo(t.context)"
                }
            },
            "cancel": {
                "discard": true,
                "to": "FooList",
                "action": {
                    "type": "Action",
                    "params": [
                        "t"
                    ],
                    "code": "scope.addTodo(t.context)"
                }
            },
            "detail": {
                "to": "FooDetail",
                "action": {
                    "type": "Action",
                    "params": [
                        "t"
                    ],
                    "code": "scope.setCurrent(t.context)"
                }
            }
        },
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
                                            "type": "Identifier",
                                            "name": "env"
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
                                "type": "ObjectPattern",
                                "properties": [
                                    {
                                        "type": "ObjectProperty",
                                        "key": "scope",
                                        "value": {
                                            "type": "Identifier",
                                            "name": "scope"
                                        }
                                    }
                                ]
                            },
                            "init": "env"
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
                        "attrs": [],
                        "kids": [
                            {
                                "type": "JSXText",
                                "value": "FooList"
                            }
                        ],
                        "type": "JSXElement"
                    },
                    {
                        "type": "JSXExpressionContainer",
                        "code": "{scope.foos.length}"
                    }
                ],
                "type": "JSXElement"
            }
        }
    },
    "extraConstants": [
        "const extra = 1234;"
    ]
}
```
  
Besides the common `"importDeclarations""` and `"extraConstants""` properties, the state data contains the `"state""`
property.

The `"type""` field is always "ViewState" for now.

The `"name""` field contains the state name that must match the module name

The `"transitionMap""` prop contains the transition map for the state, (It matches the second level of the process v1 state map).
It is always assumed to be an arrow function `(process, scope) => ...` that returns an object expression. 

The to property doesn't change but it is implied to be an *Identifier* name, not a string. The identifier must be matched with an import declaration `import MyState from "./states/MyState"` unless the to property references the viewState itself.
