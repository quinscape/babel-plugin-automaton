import {
    observable,
    computed,
    action
} from "mobx";

import CustomLayout from "../components/CustomLayout"
import CustomerList from "./states/CustomerList"

import {
    injection,
    type,
    WorkingSet
} from "@quinscape/automaton-js";

// noinspection JSUnusedGlobalSymbols
export function initProcess(process, scope)
{
    // process config
    process.layout = CustomLayout;
    process.generalHelper(12);
    process.options.forceSubProcess = true;

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

    /* Working set example */
    workingSet = new WorkingSet();

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

