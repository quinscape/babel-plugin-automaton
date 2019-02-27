// noinspection NpmUsedModulesInstalled
import React from "react"
import { Widget } from "../../components/ui"

import { observer as fnObserver } from "mobx-react-lite"

const BodylessRenderFunctionChild = props => {

    const { env : { contextPath : length } } = props;

    return (
        <Widget>
            {
                context =>
                    (
                        <em>
                            {
                                "/xxx/" + context + "/" + length
                            }
                        </em>
                    )
            }
        </Widget>
    )
};

export default fnObserver(BodylessRenderFunctionChild)

