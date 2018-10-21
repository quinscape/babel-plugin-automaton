let dataStore;

const DataStore = {

    clear: function () {
        dataStore = {};
    },

    get: function () {
        return dataStore;
    },

    entry: function (path) {

        let obj = dataStore[path];
        if (!obj)
        {
            obj = {
                importDeclarations: []
            };

            dataStore[path] = obj;
        }
        return obj;
    }
};

DataStore.clear();

module.exports = DataStore;
