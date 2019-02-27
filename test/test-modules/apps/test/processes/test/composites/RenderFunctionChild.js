// noinspection NpmUsedModulesInstalled
import React from "react"
import { Widget } from "../../components/ui"

import { observer as fnObserver } from "mobx-react-lite"

const RenderFunctionChild = props => {

    const { env : { contextPath : length } } = props;

    return (
        <Widget>
            {
                context => {

                    const uri = "/xxx/" + context + "/" + length;

                    return (
                        <em>
                            {
                                uri
                            }
                        </em>
                    )
                }
            }
        </Widget>
    )
}

export default fnObserver(RenderFunctionChild)

