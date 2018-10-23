const fs = require("fs");
const path = require("path");
//const Data = require("babel-plugin-automaton/data");
const Data = require("../data");
const shellJs = require("shelljs");

function AutomatonPlugin(options)
{
    if (typeof options.appsPath !== "string")
    {
        throw new Error("Need appsPath option.");
    }

    if (typeof options.modelPath !== "string")
    {
        throw new Error("Need modelPath option.");
    }

    // console.log("OPTIONS", JSON.stringify(options, null, 2));
    this.options = options;
}

function writeFiles(out, callback)
{
    const current = out[0].path;

    console.log("Writing model to ", current);

    if (!fs.existsSync(current))
    {
        shellJs.mkdir("-p", path.resolve(current, "..") + "/");
    }

    fs.writeFile(current, out[0].json, function () {

            const newOut = out.slice(1);
            if (newOut.length)
            {
                writeFiles(newOut, callback);
            }
            else
            {
                callback();
            }
        });
}

AutomatonPlugin.prototype.apply = function (compiler) {
    const {appsPath, modelPath} = this.options;

    //console.log(appsPath, modelPath);

    compiler.plugin("emit", function (compilation, callback) {
        const allModels = Data.get();

        const out = [];
        let i = 0;
        for (let relativePath in allModels)
        {
            if (allModels.hasOwnProperty(relativePath))
            {
                const data = allModels[relativePath];
                out[i++] = {
                    path: path.resolve(modelPath, relativePath + ".json"),
                    json: JSON.stringify(data, null, 4)
                }

            }
        }

        //console.log(out);

        writeFiles(out, callback);
    });
};

module.exports = AutomatonPlugin;
