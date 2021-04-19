import React from "react"
import { ViewState } from "@quinscape/automaton-js"
import CustomerList from "./CustomerList";

const CustomerDetail = new ViewState(
    "CustomerList",
    (process, scope) => (
        {
            "save" : {
                to: CustomerList,
                action: t => { process.back() }
            },
            "cancel" : {
                to: CustomerList
            }
        }
    ),
    props => {

        return (
            <div>
                <h1>CustomerDetail</h1>
            </div>
        )
    }
)

export default CustomerDetail;
