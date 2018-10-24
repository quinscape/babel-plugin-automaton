const fs = require("fs");
const path = require("path");
//const Data = require("babel-plugin-automaton/data");
const Data = require("../data");
const shelljs = require("shelljs");

function AutomatonPlugin(options)
{
    if (typeof options.output !== "string")
    {
        throw new Error("Need output option.");
    }

    // console.log("OPTIONS", JSON.stringify(options, null, 2));
    this.options = options;
}

function getDirOf(relativePath)
{
    const pos = relativePath.lastIndexOf("/");
    if (pos < 0)
    {
        throw new Error("Could not find / in " + relativePath);
    }
    return relativePath.substring(0, pos + 1);
}

AutomatonPlugin.prototype.apply = function (compiler)
{
    const { output, debug } = this.options;

    compiler.plugin("emit", function (compilation, callback)
    {
        const usageData = Data.get();

        for (let relativePath in usageData)
        {
            if (usageData.hasOwnProperty(relativePath))
            {
                const data = usageData[relativePath];

                const fullPath = path.resolve(output, relativePath) + ".json";

                const dir = path.resolve(output, getDirOf(relativePath));

                console.log("dir = ", dir, "fullPath = ", fullPath);

                if (!fs.existsSync(dir))
                {
                    if (debug)
                    {
                        console.log("Create directory " + dir);
                    }
                    shelljs.mkdir("-p", dir);
                }

                if (debug)
                {
                    console.log("Write data to " + fullPath);
                }

                fs.writeFileSync(fullPath, JSON.stringify(data, null, 4), "UTF-8");


            }
        }
        callback();

    });
};

module.exports = AutomatonPlugin;
