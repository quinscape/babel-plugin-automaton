import { Process } from "automaton-js";


export const EXPORTED_CONSTANT = 123456;

export function exportedFn ()
{
    
}

const CONSTANT = "Quux";

function extraFn ()
{

}

export function initProcess(process, scope)
{
    // return process states and transitions
    return (
        {
            startState: "Home",
            states: {
                "Home": {
                }
            }
        }
    );
}

