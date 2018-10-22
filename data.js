let dataStore;

const DataStore = {

    clear: function () {
        dataStore = {};
    },

    get: function () {
        return dataStore;
    },

    entry: function (path, create) {

        let obj = dataStore[path];
        if (!obj && create)
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
