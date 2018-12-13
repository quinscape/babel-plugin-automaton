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
    // return process states and transitions
    return (
        {
            startState: "FooList",
            states: {
                "FooList": {
                    "delete":
                        {
                            discard: true,
                            confirmation: ctx => (`Delete ${ctx.name} ?`),
                            to: "FooList",
                            action: scope.addTodo
                        },
                    "cancel":
                        {
                            discard: true,
                            to: "FooList",
                            action: scope.addTodo
                        }
                }
            }
        }
    );
}


export default class TestScope {
    @action
    addToDo(ctx)
    {
        // ...
    }

}

