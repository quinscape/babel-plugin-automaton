// noinspection NpmUsedModulesInstalled
import React from "react"

import { observer } from "mobx"

@observer
class SimpleComposite extends React.Component {

    render()
    {
        return (
            <div>
                <h1 className="test-class">SimpleComposite</h1>
            </div>
        )
    }
}

export default SimpleComposite

