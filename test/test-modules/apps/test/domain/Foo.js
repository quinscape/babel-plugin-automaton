import {
    observable,
    computed,
    action
} from "mobx";

import {
    injection
} from "automaton-js";


export default class Foo {
    @observable id;

    @observable name;

    @observable created;

    @observable num;

    @observable description;

    @observable type;

    @observable owner;

    @computed get short()
    {
        return this.name + ":" + this.num + ":" + this.type
    }
}
