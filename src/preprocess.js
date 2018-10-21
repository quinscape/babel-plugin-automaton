
function preprocess(node)
{
    if (!node)
    {
        return node;
    }
    else if (Array.isArray(node))
    {
        const out = [];
        for (let i = 0, j = 0; i < node.length; i++)
        {
            const result = preprocess(node[i]);
            if (result !== undefined)
            {
                out[j++] = result;
            }
        }
        return out;
    }
    else if (typeof node === "object")
    {
        const out = {};

        if (isRedundantJSXText(node))
        {
            return undefined;
        }

        for (let key in node)
        {
            if (node.hasOwnProperty(key))
            {
                const result = preprocess(node[key]);
                if (result !== undefined)
                {
                    out[key] = result;
                }
            }
        }
        return out;
    }
    else
    {
        return node;
    }
}

function isRedundantJSXText(node)
{
    if (node.type !== "JSXText")
    {
        return false;
    }

    const { value } = node;

    return /^[ \r\n\t]*$/.test(value);
}

module.exports = {
    preprocess : preprocess,
    isRedundantJSXText : isRedundantJSXText
};
