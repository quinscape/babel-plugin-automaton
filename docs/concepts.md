# Automaton Concepts

Automaton uses an intermediary JSON format, currently for composite components and process exports, to be extended as 
needed.


## Models

The current models are located in a fixed hierarchy in each automaton application.

```
Below src/main/webapp/WEB-INF/automaton:

    apps
    └── shipping
        └── processes
            ├── customer
            │   ├── composites
            │   │   └── CustomerForm.json
            │   ├── states
            │   │   └── CustomerList.json
            │   └── customer.json
            └── shipping
                ├── composites
                │   └── ShippingHome.json
                └── shipping.json
```



On the level below the `apps` folder is a directory for each app to run in one automaton servlet context.

Each app consists of several processes, each with its own folder in the `processes` folder. 

The process that is named like the app is the default process.

Each process is mapped to an URL.

This structure is mirrored starting at `src/main/js/apps/` with each JSON file corresponding to a generated JavaScript 
file at the same relative location.


### URL Mapping (WIP)

```
    https://example.com[/context]/<app>/[process/]...
```
 
 with `<app>` being the app name and `[process/]` being the optional name of the current process with a slash.
 If no process is given, the default process is used.
 
 `/context` is the servlet context path under which the automaton servlet application is running and might be empty.

 
### Model Extraction / Synchronization

In large parts, the model format is a simplified version of the Babel compiler AST und is collected by the 
"babel-plugin-automaton" NPM module during the js build. 

The package.json of the automaton applications defines to scripts to update the model information in either direction.

#### Commands

```shell 
yarn run js-to-model
```

Copies the current model.json into the model directory to commit the changes alongside the corresponding manual changes
to the generated JavaScript files.

Running the command enables the special BABEL_ENV activating the "babel-plugin-automaton". The build collects model
information from the JavaScript source files below `src/main/js/apps` and writes the data to model files below 
`src/main/webapp/WEB-INF/automaton/apps/`.

```shell 
yarn run model-to-js
```

Regenerates the Javascript sources at `src/main/js/apps/` from the model directory 
`src/main/webapp/WEB-INF/automaton/apps/`.


---
## Composite Components

Automaton Composite Components are a composite of other React components put together with a limited subset of the 
ECMA 6+ JavaScript and React component features freely available everywhere else.

The Composite Components are large, organizational components that either live standalone in the "composites" folder or
ass third argument of the view state declaration (See below).

 
Let's look at a standalone composite component in  JavaScript 
 
 ```js
import React from "react"

import { observer as fnObserver } from "mobx-react-lite"

import { DataGrid, Button, i18n } from "automaton-js"

const CustomerList = props => {

        const { env } = props;

        const { scope } = env;

        return (
            <div>
                <h1>
                    {
                        i18n('Customer List')
                    }
                </h1>
                <DataGrid
                    value={ scope.customers }
                >
                    <DataGrid.Column
                        heading={ i18n("Action") }
                    >
                        {
                            customer => (
                                <Button
                                    className="btn btn-secondary"
                                    icon="fa-edit"
                                    text="Detail"
                                    transition="to-detail"
                                    context={ customer }
                                />
                            )
                        }
                    </DataGrid.Column>
                    <DataGrid.Column name="number" />
                    <DataGrid.Column name="name" heading={ i18n("Customer:fullName") }>
                        {
                            customer => customer.salutation ? customer.salutation + " " + customer.name : customer.name
                        }
                    </DataGrid.Column>
                </DataGrid>
            </div>
        );
};

export default fnObserver(CustomerList)
 
```
 
We import the components and other modules we need for the component. All forms of ES6 imports are supported and mapped to
a simplified JSON structure.

The component contains one component that *must* be named the same as the module (without .js).  

The composite component must be the default export.

Since 0.0.10 we only support functional arrow expressions assigned to constants as components.

The usage of hooks is now allowed as it is basically just another constant definition. This means we also support
component lifecycle and local state in composites now, at least as far as their hook equivalents go.

The composite component should be a dumb presentational component. 

We snapshot all HOC invocations around the default export though so that's another possibility for easy extension.

Each view state component will receive the Automaton `env` object as property automatically. For other composites, you might 
have to use the `useAutomatonEnv` custom Hook provided by NPM "automaton-js".

We support arbitrary preparation/deconstructing of constants at the top of the render method. Since conditional `const` 
definitions can be really awkward, you can also use `let` to define these conceptual constants. 

The return statement returns the JSX element tree for the composite component. Attributes can be strings or arbritary 
JSX expressions.

One kind of JSX expression we special case, which is any kind of render prop, be it passed as children or as attribute.

Here we see an example of such a render function passed to an attribute
  
 ```js
     return (
         
         <Widget 
            renderProp={ 
                ctx => {
                    
                    const { name } = ctx;
                    
                    return (
                        <AnotherComponent className="foo" value={ name } />
                    );
                }
            }
         />
     )
 ```
  
A render function receives one or multiple arguments passed in and can again define a block of arbitrary constants
before returning another JSX element tree for that function, all of which we extract separately as a model.


### Optional components

We do support logical chaining to enable optional components

 ```js
     return (
         condition && <Widget/>
     )
 ```
 
`condition` which can be any JavaScript expression is then registered as "renderedIf" attribute of the component JSON 
model.  


---
## Process Exports

Apart from the composite components we handle another type of Javascript files which are the multi-purpose modules 
providing the process exports. These modules are located inside each process directory. They have the same module name 
as the process.

The module can have arbitrary imports and is expected to provide two exports.

### initProcess function

 ```js

import CustomLayout from "../components/CustomLayout"

import CustomerList from "./states/CustomerList";

export function initProcess(process, scope)
{
   // process config
   process.options.layout = CustomLayout;
   process.generalHelper(12);

   return CustomerList;
}
```

The `initProcess` function (which must be defined with that exact signature above ) can do an initial configuration of 
process and scope and then some optional init code to finally return the start state instance (imported from the states
folder)

With the new process v2 structure, the states are defined in their own files below "states" in the process folder.

### View States

 ```js
import React from "react";
import { ViewState } from "@quinscape/automaton-js";

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

Each view state is must return a ViewState instance as default export. 

The first constructor argument is the name of the ViewState instance must match the module name.

#### Transition Map 

The second constructor argument is the transition map function which returns the transition map. (The transition maps
used to be the second level of the state map structure in the v1 structure.)

The transition map maps transtion names to transition entries `TransitionName -> TransitionObject` (Java equivalent would be
`Map<String,Transition>`)

Each transition name points to a transition object that can have four properties

* `to` -- now contains an imported view state instance. If the target state is chosen dynamically, the property
  may be missing.

* `action` -- is either a function expression taking a transition object argument or a direct scope action reference.
  Can be left out if  the `to` property is set.
  
* `discard` -- if set to `true` the transition will discard form errors and continue on. Default is false.
* `confirmation` -- is an optional arrow function that enables transition confirmations and receives the transition 
  context object and returns a confirmation message for the user from that context. 

#### View State Component

The third constructor argument defines the component for the state. The arrow function must declare one "props" argument
and follows the same rules as the composite components and has an identical structure. The component will be automatically
wrapped in an MobX observer.
                            
          
### Process Scope

The default export of the module must be a mobx decorated process scope definition which can have any name. The process 
scope defines the basic data-model for the process which is observed by the view state components.

 ```js
import {
    observable,
    computed,
    action
} from "mobx";

import {
    injection,
    type
} from "automaton-js";

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

It can contain four kinds of members:

 * Mobx `@observable` properties (`customers` above) that also carry a DomainQL type decoration. They can optionally use 
   the magic `injection` method to receive the result of a single GraphQL query or mutation in that observable property 
   without causing additional server round-trips. 
   Otherwise the source can define static default values.
 
 * Mobx `@action` methods (`updateCustomers` above)
 
 * Mobx `@computed` getters (`rowCount` above)
 
 * General helper methods to use in other locations.
   

## Named Queries

Named Queries are an alternative to using template literal strings and maps directly in the process definition

 ```js
import {
    observable,
    computed,
    action
} from "mobx";

import {
    injection,
    type
} from "automaton-js";

import Q_NamedQuery from "./queries/Q_NamedQuery"

export default class TestScope {

    /* Current customers */
    @observable customers = injection( Q_NamedQuery );
}
```

The module ./queries/Q_NamedQuery must provide a static query() method call as default export.

import { query } from "@quinscape/automaton-js"


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

The injection mechanism works purely based on the name of the identifier. 
