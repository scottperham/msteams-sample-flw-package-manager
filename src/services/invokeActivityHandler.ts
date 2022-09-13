import { parseBool } from "adaptivecards";
import { AdaptiveCardInvokeResponse, Attachment, CardFactory, FileConsentCardResponse, InvokeResponse, MessageFactory, MessagingExtensionAction, MessagingExtensionActionResponse, MessagingExtensionAttachment, MessagingExtensionQuery, MessagingExtensionResponse, TurnContext } from "botbuilder";
import { ServiceContainer } from "./data/serviceContainer";
import { TokenProvider } from "./tokenProvider";
import "isomorphic-fetch";

export class InvokeActivityHandler {

    tokenProvider: TokenProvider;
    services: ServiceContainer;

    constructor(tokenProvider: TokenProvider, services: ServiceContainer) {
        this.tokenProvider = tokenProvider;
        this.services = services;
    }

    public async handleSignInVerifyState(turnContext: TurnContext) : Promise<InvokeResponse> {
        const token = turnContext.activity.value?.token;

        if (token) {
            await this.tokenProvider.setToken(token, turnContext);
            await turnContext.sendActivity("You have signed in successfully. Please type the command one more time");
        }

        return {
            status: 200
        };
    }

    public async handleMessagingExtensionSubmitAction(action: MessagingExtensionAction): Promise<MessagingExtensionActionResponse> {
        // switch(action.data.commandId) {
        //     case "createPosition":
        //         let position = convertInvokeActionDataToPosition(action.data) ;
        //         position = await this.services.positionService.createPosition(position);
        //         const card = this.services.templatingService.getPositionAttachment(position, true);
        //         return {
        //             task: {
        //                 type: "continue",
        //                 value: {
        //                     card,
        //                     title: "New position created",
        //                     width: "medium",
        //                     height: "medium"
        //                 }
        //             }
        //         }
        //     case "sharePosition": {
        //         const position = await this.services.positionService.getById(parseInt(action.data.positionId), true);
        //         const positionCard = this.services.templatingService.getPositionAttachment(<Position>position);
        //         return {
        //             composeExtension: {
        //                 attachments: [positionCard],
        //                 type: "result",
        //                 attachmentLayout: "list"
        //             }
        //         }
        //     }
        // }

        return {}
    }

    public async handleMessageExtensionFetchTask(context: TurnContext, action: MessagingExtensionAction): Promise<MessagingExtensionActionResponse> {

        // if (action.commandId == "newPosition") {
        //     const locations = await this.services.locationService.getAll();
        //     const recruiters = await this.services.recruiterService.getAllHiringManagers();
        //     const signedIn = await this.tokenProvider.hasToken(context);

        //     const card = this.services.templatingService.getNewPositionAttachment(recruiters, locations, "compose", signedIn);

        //     return Promise.resolve({
        //         task: {
        //             type: "continue",
        //             value: {
        //                 card,
        //                 title: "Create new position",
        //                 width: "large",
        //                 height: "large"
        //             }
        //         }
        //     });
        // }

        return Promise.resolve({});
    }

    public async handleMessagingExtensionQuery(context: TurnContext, query: MessagingExtensionQuery, source: string): Promise<MessagingExtensionResponse> {

        // if (!await this.tokenProvider.hasToken(context)) {
        //     return Promise.resolve({
        //         composeExtension: {
        //             text: "You need to be signed in to use this messaging extension, please type 'signin' into the chat with your bot",
        //             type: "message"
        //         }
        //     });
        // }

        // const initialRun = parseBool(query.parameters?.find(x => x.name == "initialRun")?.value);
        // const maxResults = initialRun ? 5 : (query.queryOptions?.count || 5);
        // const searchText = query.parameters?.find(x => x.name == "searchText")?.value;

        // const attachments: MessagingExtensionAttachment[] = [];

        // switch(query.commandId) {
        //     case "searchPositions":
        //         const positions = await this.services.positionService.search(searchText, maxResults);
                
        //         positions.forEach(x => {
        //             attachments.push({
        //                 ...this.services.templatingService.getPositionAttachment(x),
        //                 preview: this.services.templatingService.getPositionPreviewAttachment(x)
        //             })
        //         });
        //         break;
        //     case "searchCandidates":
        //         const candidates = await this.services.candidateService.search(searchText, maxResults);
        //         const recruiters = await this.services.recruiterService.getAll(true);
        //         candidates.forEach(x => {
        //             attachments.push({
        //                 ...this.services.templatingService.getCandidateAttachment(x, recruiters, "", source === "compose"),
        //                 preview: this.services.templatingService.getCandidatePreviewAttachment(x)
        //             })
        //         });
        //         break;
        // }

        return Promise.resolve({
            composeExtension: {
                attachments: [], //attachments,
                type: "result",
                attachmentLayout: "list"
            }
        });
    }

    private getAdaptiveCardInvokeResponse(status: number, attachment?: Attachment): AdaptiveCardInvokeResponse {
        return {
            type: attachment ? attachment.contentType : "",
            statusCode: status,
            value: attachment ? attachment.content : {}
        };
    }
}