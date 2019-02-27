// noinspection NpmUsedModulesInstalled
import React from "react"
import { i18n } from "automaton-js"
import { Widget as RenamedWidget, Button } from "../../components/ui"


import { observer as fnObserver } from "mobx-react-lite"

const RenderFunctionAttr = props =>  {

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

export default fnObserver(RenderFunctionAttr)

