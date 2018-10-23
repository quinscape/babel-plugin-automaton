// noinspection NpmUsedModulesInstalled
import React from "react"
import { i18n } from "automaton-js"
import { Widget as RenamedWidget, Button } from "../../components/ui"


class RenderFunctionAttr extends React.Component {

    render()
    {
        return (
            <RenamedWidget
                toolbar={
                    context => {
                        return (
                            <div>
                                <Button
                                    transition="do-stuff"
                                    text={ i18n("Do Stuff", context) }
                                />
                            </div>
                        )
                    }
                }
            >
            </RenamedWidget>
        )
    }
}

export default RenderFunctionAttr

