import { Activity, AdaptiveCardInvokeResponse, Attachment, InvokeResponse, MessageFactory, TurnContext } from "botbuilder";
import { ServiceContainer } from "./data/serviceContainer";
import { TokenProvider } from "./tokenProvider";
import "isomorphic-fetch";
import { convertInvokeActionDataToPackageData } from "./data/dtos";
import { getErrorMessageFromNotificationResult, NotificationResult } from "./data/notificationService";
import { getErrorMessageFromInstallBotResult, InstallBotResult } from "./data/graphApiService";

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
    
    public async handleNotifyAccountManager(invokeData: any, authorName: string, tenantId: string): Promise<AdaptiveCardInvokeResponse> {
        const packageData = convertInvokeActionDataToPackageData(invokeData, authorName);
        const parcel = await this.services.packageService.getByPackageId(packageData.packageId);

        if (!parcel) {
            return this.getAdaptiveCardInvokeResponse(404);
        }

        if (!parcel.accountManager) {
            return this.getAdaptiveCardInvokeResponse(404);
        }

        const activity = MessageFactory.text(`This is a message from ${authorName}: ${packageData.message}`);

        const error = await this.sendProactiveNotification(parcel.accountManager.alias, tenantId, activity);

        if (error) {
            return this.getAdaptiveCardInvokeResponse(200, this.services.templatingService.getErrorAttachment(error));
        }

        const updatedCard = this.services.templatingService.getPackageMessageSentAttachment(parcel, packageData.message);
        return this.getAdaptiveCardInvokeResponse(200, updatedCard);
    }
    
    public async handleMarkAsSent(invokeData: any): Promise<AdaptiveCardInvokeResponse> {
        const packageData = convertInvokeActionDataToPackageData(invokeData, "");
        const parcel = await this.services.packageService.getByPackageId(packageData.packageId);

        if (!parcel) {
            return this.getAdaptiveCardInvokeResponse(404);
        }

        if (!parcel.accountManager) {
            return this.getAdaptiveCardInvokeResponse(404);
        }

        parcel.status = "Sent";

        const updatedCard = this.services.templatingService.getPackageMarkedAsSentAttachment(parcel);
        return this.getAdaptiveCardInvokeResponse(200, updatedCard);
    }

    private getAdaptiveCardInvokeResponse(status: number, attachment?: Attachment): AdaptiveCardInvokeResponse {
        return {
            type: attachment ? attachment.contentType : "",
            statusCode: status,
            value: attachment ? attachment.content : {}
        };
    }

    private async sendProactiveNotification(alias: string, tenantId: string, activity: Partial<Activity>) : Promise<string | null> {
        let pnResult = await this.services.notificationService.sendProactiveNotification(alias, tenantId, activity);

        if (pnResult == NotificationResult.BotNotInstalled) {
            const biResult = await this.services.graphApiService.installBotForUser(alias, tenantId);

            if (biResult != InstallBotResult.Success){
                return getErrorMessageFromInstallBotResult(biResult);
            }

            pnResult = await this.services.notificationService.sendProactiveNotification(alias, tenantId, activity);

            if (pnResult != NotificationResult.Success) {
                return getErrorMessageFromNotificationResult(pnResult);
            }
        }

        return null;
    }
}