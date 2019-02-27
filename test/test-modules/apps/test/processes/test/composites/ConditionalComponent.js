// noinspection NpmUsedModulesInstalled
import React from "react"

import { observer as fnObserver } from "mobx-react-lite"

const ConditionalComponent = props => {

    const { env  : { contextPath : cp } } = props;

    return (
        <div>
            {
                (cp === "/foo" || cp === "") && <h1> ConditionalComponent </h1>
            }
        </div>
    )
}

export default fnObserver(ConditionalComponent)

