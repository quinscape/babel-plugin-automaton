import { Process } from "automaton-js";

import Home from "./states/Home"
import TargetA from "./states/TargetA"
import TargetB from "./states/TargetB"
import TargetC from "./states/TargetC"

const targets = {
    A: TargetA,
    B: TargetB,
    C: TargetC,
}

/**
 *
 * @param {Process} process
 * @param {object} scope
 * @return {{startState: string, states: {ProcessTestHome: {"open-sub": {to: string, action: (function(*): *)}}}}}
 */
export function initProcess(process, scope)
{
    const { target } = process.input;

    return (target ? targets[target.toUpperCase()] || Home : Home);
}

