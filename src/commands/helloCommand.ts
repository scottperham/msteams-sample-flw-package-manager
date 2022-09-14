import { CardFactory, MessageFactory, TurnContext } from "botbuilder";
import { ServiceContainer } from "../services/data/serviceContainer";
import { CommandBase } from "./commandBase";


export class HelloCommand extends CommandBase {

    constructor(services: ServiceContainer) {
        super("hello", services);
    }

    public async execute(turnContext: TurnContext): Promise<void> {
        const card = this.services.templatingService.getHelloAttachment(turnContext.activity.from.name);

        const activity = MessageFactory.attachment(card);

        await turnContext.sendActivity(activity);
    }
}
