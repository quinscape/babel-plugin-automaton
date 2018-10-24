const assert = require("power-assert");
const {transform, Switch, Any} = require("../src/transform");

describe("Transform", function () {

    it("copies properties as is", function () {

        assert.deepEqual(
            transform(
                {
                    name: "Adam",
                    ignored: "bla",
                    sub: {
                        age: 23
                    }
                }, {
                    name: true,
                    sub: true
                }
            ),
            {
                name: "Adam",
                sub: {
                    age: 23
                }
            }
        )
    });
    it("substitutes string rule values", function () {

        assert.deepEqual(
            transform(
                {
                    name: "Adam",
                    ignored: "bla",
                    sub: {
                        age: 23
                    }
                }, {
                    name: "Bob"
                }
            ),
            {
                name: "Bob"
            }
        )
    });

    it("recurses into properties", function () {

        assert.deepEqual(
            transform(
                {
                    name: "Adam",
                    sub: {
                        age: 23,
                        ignored: "bla"
                    }
                }, {
                    name: true,
                    sub: {
                        age: true
                    }
                }
            ),
            {
                name: "Adam",
                sub: {
                    age: 23
                }
            }
        )
    });

    it("transforms values", function () {

        assert.deepEqual(
            transform(
                {
                    name: "Adam",
                    sub: {
                        age: 23
                    }
                }, {
                    name: true,
                    sub: {
                        age: function (age) {
                            return age * 2
                        }
                    }
                }
            ),
            {
                name: "Adam",
                sub: {
                    age: 46
                }
            }
        )
    });

    it("supports direct transformation", function () {

        assert.deepEqual(
            transform(
                {
                    name: "Adam",
                    sub: {
                        age: 23
                    }
                }, function (p) {
                    p.name = p.name.toUpperCase();
                    return p;
                }
            ),
            {
                name: "ADAM",
                sub: {
                    age: 23
                }
            }
        )
    });

    it("transforms arrays", function () {

        assert.deepEqual(
            transform(
                [
                    {
                        name: "Adam"
                    },
                    {
                        name: "Berta"
                    }
                ], {
                    name: function (name) {
                        return name.toUpperCase();
                    }
                }
            ),
            [
                {
                    name: "ADAM"
                },
                {
                    name: "BERTA"
                }
            ]
        );

        assert.deepEqual(
            transform(
                {
                    people:
                        [
                            {
                                name: "Adam"
                            },
                            {
                                name: "Berta"
                            }
                        ]
                }, {
                    people: {
                        name: function (name) {
                            return name.toUpperCase();
                        }
                    }
                }
            ),
            {
                people: [
                    {
                        name: "ADAM"
                    },
                    {
                        name: "BERTA"
                    }
                ]

            }
        )
    });

    it("filters undefined results from arrays", function () {

        assert.deepEqual(
            transform(
                [
                    {
                        name: "Adam"
                    },
                    {
                        name: "Berta"
                    },
                    {
                        name: "Klaus"
                    }
                ], function (node) {
                    const { name } = node;
                    if (name !== "Klaus")
                    return name.toUpperCase();
                }
            ),
            [
                "ADAM","BERTA"
            ]
        );

    });

    it("filters undefined results from Objects", function () {

        assert.deepEqual(
            transform({
                a: "value"
            },{
                a: function (node) {}
            }),
            {
            }
        );

    });

    it("Switch()es based on type properties", function () {

        assert.deepEqual(
            transform(
                {
                    people: [
                        {
                            type: "A",
                            name: "Adam"
                        },
                        {
                            type: "B",
                            name: "Berta"
                        }
                    ]
                }
                , {
                    people: Switch({
                        A: {
                            name: function (name) {
                                return "*" + name;
                            }

                        },
                        B: {
                            name: true
                        }
                    })
                }
            ),
            {
                people: [
                    {
                        type: "A",
                        name: "*Adam"
                    },
                    {
                        type: "B",
                        name: "Berta"
                    }
                ]
            }
        )
    });

    it("Switch()es based on other properties", function () {

        assert.deepEqual(
            transform(
                {
                    people: [
                        {
                            type: "A",
                            name: "Adam"
                        },
                        {
                            type: "B",
                            name: "Berta"
                        }
                    ]
                }
                , {
                    people: Switch(
                        "name",
                        {
                            Adam: {
                                type: true

                            },
                            Berta: {
                                type: function (name) {
                                    return "*" + name;
                                }
                            }
                        }
                    )
                }
            ),
            {
                people: [
                    {
                        name: "Adam",
                        type: "A"
                    },
                    {
                        name: "Berta",
                        type: "*B"
                    }
                ]
            }
        )
    });

    it("Switch()es back to default", function () {

        assert.deepEqual(
            transform(
                {
                    people: [
                        {
                            type: "A",
                            name: "Adam"
                        },
                        {
                            type: "B",
                            name: "Berta"
                        },
                        {
                            type: "CCC",
                            name: "Clara"
                        }
                    ]
                }
                , {
                    people: Switch({
                        A: {
                            name: function (name) {
                                return "*" + name;
                            }

                        },
                        B: {
                            name: true
                        },

                        default: {
                            name: function (name) {
                                return name.toUpperCase();
                            }
                        }
                    })
                }
            ),
            {
                people: [
                    {
                        type: "A",
                        name: "*Adam"
                    },
                    {
                        type: "B",
                        name: "Berta"
                    },
                    {
                        type: "CCC",
                        name: "CLARA"
                    }
                ]
            }
        )
    });

    it("does not abide by falsy rules (except on 'type')", function () {

        assert.throws(
            function () {
                transform(
                    {
                        type: "A",
                        name: "Adam"
                    }
                    , false
                )
            },
            /Invalid rule prop: root = false/
        )

        assert.throws(
            function () {
                transform(
                    {
                        people: [
                            {
                                type: "A",
                                name: "Adam"
                            }
                        ]
                    }
                    , {
                        people: {
                            name: null
                        }

                    }
                )
            },
            /Error: Invalid rule prop: root.people.0.name = null/
        )
    });

    it("does not recurse into non-objects", function () {

        assert.throws(
            function () {
                transform(
                    {
                        type: "A",
                        name: "Adam"
                    }
                    , {
                        type: {
                            name: "B"
                        }
                    }
                )
            },
            /Cannot recurse into non-object at root.type: "A"/
        )

    });

    it("copies the 'type' property by default", function () {

        assert.deepEqual(
            transform(
                {
                    type: "Person",
                    name: "Adam",
                    ignored: "bla",
                    sub: {
                        age: 23
                    }
                }, {
                    name: true
                }
            ),
            {
                type: "Person",
                name: "Adam"
            }
        )
    });

    it("doesn't copy the 'type' property if its null on the rule", function () {

        const result = transform(
            {
                people: [
                    {
                        type: "A",
                        name: "Adam"
                    },
                    {
                        type: "B",
                        name: "Berta"
                    }
                ]
            }
            , {
                people: Switch({
                    A: {
                        type: null,
                        name: function (name) {
                            return "*" + name;
                        }

                    },
                    B: {
                        type: null,
                        name: true
                    }
                })
            }
        );
        assert.deepEqual(
            result,
            {
                people: [
                    {
                        name: "*Adam"
                    },
                    {
                        name: "Berta"
                    }
                ]
            }
        )
    });


    it("handles maps with Any()", function () {

        assert.deepEqual(
            transform(
                {
                    AAA: {
                        name: "Adam"
                    },
                    BBB: {
                        name: "Berta"
                    }
                }
                ,
                Any(
                    {

                        name: function(n) { return n.toUpperCase() }
                    }
                )
            ),
            {
                AAA: {
                    name: "ADAM"
                },
                BBB: {
                    name: "BERTA"
                }
            }
        )
    });
});
