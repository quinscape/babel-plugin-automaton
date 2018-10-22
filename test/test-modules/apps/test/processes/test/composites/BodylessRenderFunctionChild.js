// noinspection NpmUsedModulesInstalled
import React from "react"
import { Widget } from "../../components/ui"


class BodylessRenderFunctionChild extends React.Component {

    render()
    {
        const { env : { contextPath : length } } = this.props;

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
    }
}

export default BodylessRenderFunctionChild

