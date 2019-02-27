// noinspection NpmUsedModulesInstalled
import React from "react"

import { observer as fnObserver } from "mobx-react-lite"

const SimpleComposite = props => {
    return (
        <div>
            <h1 className="test-class">SimpleComposite</h1>
        </div>
    )
}

export default fnObserver(SimpleComposite)

