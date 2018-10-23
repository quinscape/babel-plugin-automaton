const fs = require("fs");
//const Data = require("babel-plugin-automaton/data");
const Data = require("../data");

function AutomatonPlugin(options)
{
    if (typeof options.output !== "string")
    {
        throw new Error("Need output option.");
    }

    // console.log("OPTIONS", JSON.stringify(options, null, 2));
    this.options = options;
}

AutomatonPlugin.prototype.apply = function (compiler)
{
    const { output, debug } = this.options;

    compiler.plugin("emit", function (compilation, callback)
    {
        var usageData = Data.get();

        if (debug)
        {
            console.log("Write data to " + output);
        }
        fs.writeFile(output, JSON.stringify(usageData), callback);
    });
};

module.exports = AutomatonPlugin;
