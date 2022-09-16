import { CardFactory, MessageFactory, TurnContext } from "botbuilder";
import { ServiceContainer } from "../services/data/serviceContainer";
import { CommandBase } from "./commandBase";


export class ConsentCommand extends CommandBase {

    constructor(services: ServiceContainer) {
        super("consent", services);
    }

    public async execute(turnContext: TurnContext): Promise<void> {

        const activity = MessageFactory.attachment(this.services.templatingService.getConsentAttachment());

        await turnContext.sendActivity(activity);
    }
}
