// noinspection NpmUsedModulesInstalled
import React, { useState } from "react"
import cx from "classnames"

import { observer as fnObserver } from "mobx-react-lite"

const ArrayDestructingConstant = props => {

    const [ flag, setFlag ] = useState( false);

    const [ a, { b: c} ] = props;

    return (
        <div>
            <button
                className={
                    cx(
                        "btn",
                        flag ? "btn-success" : "btn-danger"
                    )
                }
                onClick={ () => setFlag(!flag) }
            >
                ArrayDestructingConstant
            </button>
        </div>
    )
}

export default fnObserver(ArrayDestructingConstant)

