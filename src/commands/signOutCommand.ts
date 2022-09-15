import { MessageFactory, TurnContext } from "botbuilder";
import { ServiceContainer } from "../services/data/serviceContainer";
import { UserProvider } from "../services/userProvider";
import { CommandBase } from "./commandBase";

export class SignOutCommand extends CommandBase {

    userProvider: UserProvider;

    constructor(services: ServiceContainer, userProvider: UserProvider) {
        super("signout", services);

        this.userProvider = userProvider;
    }

    public async execute(turnContext: TurnContext): Promise<void> {

        if (!await this.userProvider.hasUser(turnContext)) {
            await turnContext.sendActivity("You are not signed in");
            return;
        }

        // We are simply going to clear the user state for the token
        await this.userProvider.setUser(undefined, turnContext);
        
        await turnContext.sendActivity("You have been successfuly signed out");
    }
}


