import {
    observable,
    computed,
    action
} from "mobx";

import CustomLayout from "../components/CustomLayout"

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

    // return process states and transitions
    return (
        {
            startState: "CustomerList",
            states: {
                "CustomerList": {
                    "to-detail":
                        {
                            to: "CustomerDetail",
                            action: scope.addTodo
                        }
                },
                "CustomerDetail": {
                    "save" : {
                        to: "CustomerList",
                        action: t => { process.back() }
                    },
                    "cancel" : {
                        to: "CustomerList"
                    }
                }
            }
        }
    );
}

export default class TestScope {

    /* Current customers */
    @type("PagedCustomer")
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

