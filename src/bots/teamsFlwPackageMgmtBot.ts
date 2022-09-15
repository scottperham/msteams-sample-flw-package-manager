import { TeamsActivityHandler, TurnContext, UserState, Activity, SigninStateVerificationQuery, MessageFactory, AdaptiveCardInvokeResponse, AdaptiveCardInvokeValue, MessagingExtensionQuery, MessagingExtensionResponse, MessagingExtensionAction, MessagingExtensionActionResponse, FileConsentCardResponse, StatePropertyAccessor } from "botbuilder";
import { CommandBase } from "../commands/commandBase";
import { HelpCommand } from "../commands/helpCommand";
import { PackageDetailsCommand } from "../commands/packageDetailsCommand";
import { ServiceContainer } from "../services/data/serviceContainer";
import { InvokeActivityHandler } from "../services/invokeActivityHandler";
import { SignOutCommand } from "../commands/signOutCommand";
import { SignInCommand } from "../commands/signInCommand";
import { ConsentCommand } from "../commands/consentCommand";
import { HelloCommand } from "../commands/helloCommand";
import { UserProvider } from "../services/userProvider";

export class TeamsFlwPackageMgmtBot extends TeamsActivityHandler {

    userState: UserState;
    invokeHandler: InvokeActivityHandler;
    commands: {command: CommandBase, requireAuth: boolean}[];
    defaultCommand: CommandBase;
    services: ServiceContainer;
    userProvider: UserProvider;

    constructor(userState: UserState, services: ServiceContainer) {
        super();

        this.userState = userState;
        this.services = services;

        this.userProvider = new UserProvider(userState);
        this.invokeHandler = new InvokeActivityHandler(this.userProvider, services);

        // Setup a simple array of available command implementations and whether they require authentication or not
        this.commands = [
            {command: new HelpCommand(services), requireAuth: false },
            {command: new PackageDetailsCommand(services), requireAuth: false},
            {command: new SignOutCommand(services, this.userProvider), requireAuth: false},
            {command: new SignInCommand(services, this.userProvider), requireAuth: false},
            {command: new ConsentCommand(services), requireAuth: false}
        ]

        this.defaultCommand = new HelloCommand(services);

        // This is a generic handler for any inbound activity with a type of "text"
        // This could be a simple text message or something more complex like
        // an Adaptive Card result from an Action.Submit button (that wasn't invoked
        // from a messaging extension).
        this.onMessage(async (context, next): Promise<void> => {

            if (this.hasFiles(context.activity)) {
                // TODO: handle files
            }

            // Just a simple text message?
            if (context.activity.text) {
                await this.handleTextMessage(context, context.activity.text);
            }

            await next();
        });

        this.onInstallationUpdate(async (context, next): Promise<void> => {
            // If the app was updated or uninstalled, clear the welcome message state for the current user
            if (context.activity.action == "add") {
                await new ConsentCommand(this.services).execute(context);
            }
            await next();
        });
    }

    // This is the entry point for the bot processing pipeline
    // Generally we want the base class to handle the initial processing
    // but this is a great place to save any state changes we've set
    // during the turn
    async run(context: TurnContext): Promise<void> {
        await super.run(context);

        await this.userState.saveChanges(context);
    }

    // This is a really simple implementation of the Strategy design pattern.
    // This could also be implemented with Dialogs which could be a better option if
    // we had more complex conversational flows between the user and the bot... but we dont!
    private async handleTextMessage(context: TurnContext, text: string) : Promise<void> {

        const commandText = text.trim().toLowerCase();
        const commandContainer = this.commands.find(x => commandText.startsWith(x.command.id))

        if (commandContainer) {

            let command = commandContainer.command;

            if (commandContainer.requireAuth) {

                if (!await this.userProvider.hasUser(context)) {
                    // We've found the command and determined that you need to be signed in
                    // to execute it. As there is no cached token, we create this as a sign in
                    // command instead to take the user though the sign in and consent flow
                    command = new SignInCommand(this.services, this.userProvider);
                }
            }
            
            // Execute the command
            await command.execute(context);
        }
        else if (this.defaultCommand) {
            await this.defaultCommand.execute(context);
        }
        else {
            await context.sendActivity("Sorry, I didn't recognise that command. Type 'help' to see what I can do.");
        }
    }

    // Handles clicking an adaptive card button with `Action.Execute`
    protected async onAdaptiveCardInvoke(context: TurnContext, invokeValue: AdaptiveCardInvokeValue): Promise<AdaptiveCardInvokeResponse> {
        
        const user = await this.userProvider.getUser(context);

        //Buttons with action.execute have a "verb" property to determine what the bot should do with the posted data
        switch(invokeValue.action.verb) {
            case "NotifyAm":
                return await this.invokeHandler.handleNotifyAccountManager(invokeValue.action.data, context.activity.from.name, context.activity.channelData.tenant.id);
            case "MarkAsSent":
                return await this.invokeHandler.handleMarkAsSent(invokeValue.action.data);
            case "SendPackageId":
                return await this.invokeHandler.handleSendPackageId(invokeValue.action.data);
            case "NotifyFlw":
                return await this.invokeHandler.handleSendNotifyFlw(invokeValue.action.data, context.activity.channelData.tenant.id, user!);
        }

        return {
            statusCode: 400,
            type: "",
            value: {}
        };
    }

    // Handles the callback from a signin and consent attempt - the token is in `context.activity.value.token`
    protected async handleTeamsSigninTokenExchange(context: TurnContext, query: SigninStateVerificationQuery): Promise<void> {
        await this.invokeHandler.handleSignInVerifyState(context);
    }

    private hasFiles(activity: Activity) : boolean {
        return activity.attachments?.some(x => x.contentType == "application/vnd.microsoft.teams.file.download.info") || false;
    }
}