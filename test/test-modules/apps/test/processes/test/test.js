import {
    observable,
    computed,
    action
} from "mobx";

import MySpecialLayout from "./components/MySpecialLayout"

import { injection } from "automaton-js";

// noinspection JSUnusedGlobalSymbols
export const initProcess = (process, scope) => {

    // process config
    process.layout = MySpecialLayout;

    // return process states and transitions
    return (
        {
            startState: "CustomerList",
            states: {
                "CustomerList": [
                    {
                        to: "CustomerDetail",
                        action: scope.addTodo
                    }
                ],
                "TodoDetail": [
                    {
                        name: "to-detail",
                        to: [ "TodoList" ],
                        action: () => {


                            todo.one();
                            if (scope.flag)
                            {
                                process.transitionTo("C")
                            }
                        }
                    }
                ],
                "C": [
                    {
                        to: "D"
                    }
                ]
            }
        }
    );
};

export default class TestScope {

    @observable currentObject = null;

    /** {PagedTodo} Current todos */
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

    // variante 2
    @action
    updateCustomers(customers)
    {
        this.customers = customers;
    }
}
