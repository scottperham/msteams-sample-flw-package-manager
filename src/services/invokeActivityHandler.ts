import { Activity, AdaptiveCardInvokeResponse, Attachment, InvokeResponse, MessageFactory, TurnContext } from "botbuilder";
import { ServiceContainer } from "./data/serviceContainer";
import { UserProvider } from "./userProvider";
import "isomorphic-fetch";
import { convertInvokeActionDataToPackageData, User } from "./data/dtos";
import { getErrorMessageFromNotificationResult, NotificationResult } from "./data/notificationService";
import { getErrorMessageFromInstallBotResult, InstallBotResult } from "./data/graphApiService";
import jwt_decode from 'jwt-decode';

export class InvokeActivityHandler {

    userProvider: UserProvider;
    services: ServiceContainer;

    constructor(userProvider: UserProvider, services: ServiceContainer) {
        this.userProvider = userProvider;
        this.services = services;
    }

    public async handleSignInVerifyState(turnContext: TurnContext) : Promise<InvokeResponse> {
        const token = turnContext.activity.value?.token;

        if (token) {

            //Crack open the token!
            const claims = jwt_decode(token) as any;

            const upn = claims.preferred_username as string;
            const alias = upn.substring(0, upn.indexOf("@"));

            const user = await this.services.userService.getByAlias(alias);

            if (!user) {
                await turnContext.sendActivity("Sorry, I don't know who you are!");    
            }
            else {
                await this.userProvider.setUser(user, turnContext);
                await turnContext.sendActivity(`Hi ${user.name}, you have signed in successfully. Please type the command one more time`);
            }
        }

        return {
            status: 200
        };
    }

    public async handleSendNotifyFlw(invokeData: any, tenantId: string, user: User): Promise<AdaptiveCardInvokeResponse> {
        const parcel = await this.services.packageService.getByPackageId(invokeData.packageId);
        const flwUser = await this.services.userService.getById(invokeData.fromId);

        if (!parcel) {
            return this.getAdaptiveCardInvokeResponse(404);
        }
        
        if (!flwUser) {
            return this.getAdaptiveCardInvokeResponse(404);
        }

        const activity = MessageFactory.attachment(this.services.templatingService.getFlwMessageAttachment(parcel, invokeData.message, user.name));

        const error = await this.sendProactiveNotification(flwUser.alias, tenantId, activity);

        if (error) {
            return this.getAdaptiveCardInvokeResponse(200, this.services.templatingService.getErrorAttachment(error));
        }

        const updatedCard = this.services.templatingService.getFlwMessageSentAttachment(parcel, flwUser, invokeData.message);
        return this.getAdaptiveCardInvokeResponse(200, updatedCard);
    }
    
    public async handleNotifyAccountManager(invokeData: any, from: User, tenantId: string): Promise<AdaptiveCardInvokeResponse> {
        const packageData = convertInvokeActionDataToPackageData(invokeData);
        const parcel = await this.services.packageService.getByPackageId(packageData.packageId);

        if (!parcel) {
            return this.getAdaptiveCardInvokeResponse(404);
        }

        if (!parcel.accountManager) {
            return this.getAdaptiveCardInvokeResponse(404);
        }

        //const activity = MessageFactory.text(`This is a message from ${authorName}: ${packageData.message}`);
        const activity = MessageFactory.attachment(this.services.templatingService.getAccountManagerMessageAttachment(parcel, from, packageData.message));

        const error = await this.sendProactiveNotification(parcel.accountManager.alias, tenantId, activity);

        if (error) {
            return this.getAdaptiveCardInvokeResponse(200, this.services.templatingService.getErrorAttachment(error));
        }

        const updatedCard = this.services.templatingService.getPackageMessageSentAttachment(parcel, packageData.message);
        return this.getAdaptiveCardInvokeResponse(200, updatedCard);
    }
    
    public async handleMarkAsSent(invokeData: any): Promise<AdaptiveCardInvokeResponse> {
        const packageData = convertInvokeActionDataToPackageData(invokeData);
        const parcel = await this.services.packageService.getByPackageId(packageData.packageId);

        if (!parcel) {
            return this.getAdaptiveCardInvokeResponse(404);
        }

        if (!parcel.accountManager) {
            return this.getAdaptiveCardInvokeResponse(404);
        }

        parcel.status = "Sent";
        await this.services.packageService.Update(parcel);

        const updatedCard = this.services.templatingService.getPackageMarkedAsSentAttachment(parcel);
        return this.getAdaptiveCardInvokeResponse(200, updatedCard);
    }

    public async handleSendPackageId(invokeData: any): Promise<AdaptiveCardInvokeResponse> {
        const packageId = invokeData.packageId;
        const parcel = await this.services.packageService.getByPackageId(packageId);

        if (!parcel) {
            return this.getAdaptiveCardInvokeResponse(404);
        }

        if (!parcel.accountManager) {
            return this.getAdaptiveCardInvokeResponse(404);
        }

        const updatedCard = this.services.templatingService.getPackageAttachment(parcel);
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