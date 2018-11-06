import { Process } from "automaton-js";


/**
 *
 * @param {Process} process
 * @param {object} scope
 * @return {{startState: string, states: {ProcessTestHome: {"open-sub": {to: string, action: (function(*): *)}}}}}
 */
export function initProcess(process, scope)
{
    // return process states and transitions
    return (
        {
            startState: t => {

                const { target } = process.input;

                t.target = ( target && "Target" + target.toUpperCase()) || "Home";
            },
            states: {
                "Home": {
                },
                "TargetA": {
                    "back" : { to : "Home" }
                },
                "TargetB": {
                    "back" : { to : "Home" }
                },
                "TargetC": {
                    "back" : { to : "Home" }
                },
            }
        }
    );
}

