// noinspection NpmUsedModulesInstalled
import React from "react"

import { observer as fnObserver } from "mobx-react-lite"

export const EXTRA = 1412, EX2 = 111;

export function test()
{
    console.log("test")
}

const SimpleComposite = props => {
    return (
        <div>
            <h1 className="test-class">SimpleComposite</h1>
            <input disabled/>
        </div>
    )
}

export default fnObserver(SimpleComposite)

