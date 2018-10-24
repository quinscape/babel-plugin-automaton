// noinspection NpmUsedModulesInstalled
import React from "react"

import { observer } from "mobx"

@observer
class ConditionalComponent extends React.Component {

    render()
    {
        const { env  : { contextPath : cp } } = this.props;

        return (
            <div>
                {
                    (cp === "/foo" || cp === "") && <h1> ConditionalComponent </h1>
                }
            </div>
        )
    }
}

export default ConditionalComponent

