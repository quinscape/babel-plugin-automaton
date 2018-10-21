// noinspection NpmUsedModulesInstalled
import React from "react"
import { Widget } from "../../components/ui"

class RenderFunctionChild extends React.Component {

    render()
    {
        const { env : { contextPath : length } } = this.props;

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
}

export default RenderFunctionChild

