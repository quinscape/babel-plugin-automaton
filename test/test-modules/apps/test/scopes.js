import {
    action,
    observable
} from "mobx";

import { type } from "automaton-js";

export class ApplicationScope
{
    @type("String")
    @observable configValue = "";

    @action appScopeAction(s)
    {
        this.configValue = s;
    }
}

export class UserScope
{
    @type("Int")
    @observable configValue = 1283;

    @action userScopeAction(n)
    {
        this.configValue = n;
    }

}

export class SessionScope
{
    @type("Boolean")
    @observable configValue = false;

    @action userScopeAction(f)
    {
        this.configValue = f;
    }
}

