function transformRecursive(node, rule, path)
{

    if (Array.isArray(node))
    {
        const count = node.length;
        const out = new Array(count);

        let i = 0;
        let j = 0;
        while (i < count)
        {
            const result = transformRecursive(node[i], rule, path.concat(i++));
            if (result !== undefined)
            {
                out[j++] = result;
            }
        }
        if (j < count)
        {
            return out.slice(0, j);
        }
        return out;
    }

    if (!rule)
    {
        throw new Error("Invalid rule prop: " + path.join(".") + " = " + JSON.stringify(rule));
    }

    if (rule === true)
    {
        return node;
    }
    else if (typeof rule === "string")
    {
        return rule;
    }
    else if (typeof rule === "function")
    {
        const result = rule(node);
        return result;
    }

    if (!node || typeof node !== "object" )
    {
        throw new Error("Cannot recurse into non-object at " + path.join(".") + ": " + JSON.stringify(node));
    }

    const out = {};

    // copy type property by default if present, might be overrwritten by rule
    if (node.type && rule.type !== null)
    {
        out.type = node.type;
    }


    for (let key in rule)
    {
        if (rule.hasOwnProperty(key))
        {
            const ruleProp = rule[key];

            if (key !== "type" || ruleProp !== null)
            {
                const result = transformRecursive(node[key], ruleProp, path.concat(key));
                if (result !== undefined)
                {
                    out[key] = result;
                }
            }
        }
    }
    return out;
}

/**
 * Transforms an Babel AST to a simplified JSON structure based on a given rule object.
 *
 * The shape of the rule object defines the final JSON output. Properties of the source object are copied, transformed or ignored
 * based on the rule property:
 *
 *  * true: keep as-is
 *
 *  * a string : replace property with that string
 *
 *  * a function : call the function with the source property and use the result as replacement. If the result is undefined, ignore the property.
 *
 *  * an object : recurse into source property with object as new rule object
 *
 * @param node      Babel AST node
 * @param rule      Transform object
 */
function transform(node, rule)
{
    return transformRecursive(node, rule, ["root"]);
}

/**
 * Switch function. Takes a map of choices. If the value equals one of the keys, the value is used as sub-rule, otherwise
 * the property is ignored.
 * 
 * @param [key]          key to switch on,. Default is "type"
 * @param switchRule
 * @return {Function}
 */
function Switch(key, switchRule)
{
    if (switchRule === undefined)
    {
        switchRule = key;
        key = "type"
    }

    //console.log("Switch", fn.toString(), switchRule.toString());

    return function (node) {

        const value = node[key];

        let result;
        if (switchRule.hasOwnProperty(value))
        {
            const subRule = switchRule[value];
            result = transformRecursive(node, subRule, ["Switch('" + value + "')"]);
            if (result && !result[key] && subRule[key] !== null)
            {
                result[key] = value;
            }
        }
        else if (switchRule.default)
        {
            result = transformRecursive(node, switchRule.default, ["Switch.default"])
            if (result && !result[key] && switchRule.default[key] !== null)
            {
                result[key] = value;
            }
        }
        return result;
    }
}

/**
 * Any Helper. Takes any key of one level and applies a given rule to all of them. Useful for map constructs.
 *
 * @param rule      rule for the map values
 * @return {function(object)} function
 */
function Any(rule)
{
    return function (node) {

        const out = {};

        for (let key in node)
        {
            if (node.hasOwnProperty(key))
            {
                const value = node[key];
                out[key] = transform(value, rule);
            }
        }
        return out;
    }
}

module.exports = {
    transform: transform,
    Switch: Switch,
    Any: Any
};
