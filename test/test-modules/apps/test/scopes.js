import {
    action,
    observable
} from "mobx";

import { type } from "automaton-js";

export class ApplicationScope
{
    @observable configValue = "";

    @action appScopeAction(s)
    {
        this.configValue = s;
    }
}

export class UserScope
{
    @observable configValue = 1283;

    @action userScopeAction(n)
    {
        this.configValue = n;
    }

}

export class SessionScope
{
    @observable configValue = false;

    @action userScopeAction(f)
    {
        this.configValue = f;
    }
}


export class LocalScope
{
    @observable configValue = false;

    @action localScopeAction(f)
    {
        this.configValue = f;
    }
}


export class CommonScope
{
    @observable configValue = false;

    @action commonScopeAction(f)
    {
        this.configValue = f;
    }
}

