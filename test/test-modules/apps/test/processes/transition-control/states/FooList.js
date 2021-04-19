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
