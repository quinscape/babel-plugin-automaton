import React from "react"
import { ViewState } from "@quinscape/automaton-js"
import CustomerDetail from "./CustomerDetail";

const CustomerList = new ViewState(
    "CustomerList",
    (process, scope) => (
        {
            "to-detail":
                {
                    to: CustomerDetail,
                    action: scope.addTodo
                }
        }
    ),
    props => {

        return (
            <div>
                <h1>CustomerList</h1>
            </div>
        )
    }
)

export default CustomerList;
