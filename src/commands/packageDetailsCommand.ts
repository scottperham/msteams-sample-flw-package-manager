import { CardFactory, MessageFactory, TurnContext } from "botbuilder";
import { ServiceContainer } from "../services/data/serviceContainer";
import { CommandBase } from "./commandBase";


export class PackageDetailsCommand extends CommandBase {

    constructor(services: ServiceContainer) {
        super("package", services);
    }

    public async execute(turnContext: TurnContext): Promise<void> {
        const text = this.getTextWithoutCommand(turnContext.activity.text);
        const thePackage = await this.services.packageService.getByPackageId(text);

        if (!thePackage) {
            await turnContext.sendActivity("Cannot find that package");
            return;
        }

        const card = this.services.templatingService.getPackageAttachment(thePackage);

        const activity = MessageFactory.attachment(card);

        await turnContext.sendActivity(activity);
    }
}
