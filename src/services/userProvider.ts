import { StatePropertyAccessor, TurnContext, UserState } from "botbuilder";
import { User } from "./data/dtos";

export class UserProvider {
    tokenAccessor: StatePropertyAccessor<User | undefined>;

    constructor(userState: UserState) {
        this.tokenAccessor = userState.createProperty<User>("user");
    }

    public getUser(turnContext: TurnContext) : Promise<User | undefined> {
        return this.tokenAccessor.get(turnContext);
    }

    public setUser(token: User | undefined, turnContext: TurnContext) : Promise<void> {
        return this.tokenAccessor.set(turnContext, token);
    }

    public async hasUser(turnContext: TurnContext) : Promise<boolean> {
        return !!(await this.getUser(turnContext));
    }
}