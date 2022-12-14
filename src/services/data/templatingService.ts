import { Package, User } from "./dtos";
import * as fs from 'fs';
import * as path from 'path';
import * as act from 'adaptivecards-templating';
import { ActionTypes, Attachment, CardFactory } from "botbuilder";


export class TemplatingService {

    flwPackageTemplate: string = "";
    flwPackageMessageSentTemplate: string = "";
    flwPackageMarkAsSentTemplate: string = "";
    flwResponseFromAmTemplate: string = "";
    amCardTemplate: string = "";
    amCardMessageSentTemplate: string = "";
    helloTemplate: string = "";
    errorTemplate: string = "";
    templatesPath: string = "";

    public load(templatesPath: string) {
        this.templatesPath = templatesPath;
        this.flwPackageTemplate = fs.readFileSync(path.join(templatesPath, "flwcard.json")).toString();
        this.flwPackageMessageSentTemplate = fs.readFileSync(path.join(templatesPath, "flwcard-update-messagecard.json")).toString();
        this.flwPackageMarkAsSentTemplate = fs.readFileSync(path.join(templatesPath, "flwcard-update-markedassent.json")).toString();
        this.flwResponseFromAmTemplate = fs.readFileSync(path.join(templatesPath, "flwcard-responsefromam.json")).toString();

        this.amCardTemplate = fs.readFileSync(path.join(templatesPath, "amcard.json")).toString();
        this.amCardMessageSentTemplate = fs.readFileSync(path.join(templatesPath, "amcard-update-responsecard.json")).toString();

        this.errorTemplate = fs.readFileSync(path.join(templatesPath, "errorcard.json")).toString();
        this.helloTemplate = fs.readFileSync(path.join(templatesPath, "hellocard.json")).toString();
    }

    public getAccountManagerMessageAttachment(parcel: Package, from: User, message: string) : Attachment {
        const template = new act.Template(JSON.parse(this.amCardTemplate));
        const payload = template.expand({
            $root: {
                ...parcel,
                from,
                message,
                customerDisplayName: `${parcel.customer} - ${parcel.customerId}`,
                viewUrl: "https://google.com"
            }
        });

        return CardFactory.adaptiveCard(payload);    
    }

    public getFlwMessageSentAttachment(parcel: Package, to: User, message: string) : Attachment {
        const template = new act.Template(JSON.parse(this.amCardMessageSentTemplate));
        const payload = template.expand({
            $root: {
                ...parcel,              
                to,
                message,
                customerDisplayName: `${parcel.customer} - ${parcel.customerId}`,
                viewUrl: "https://google.com"
            }
        });

        return CardFactory.adaptiveCard(payload);    
    }

    public getFlwMessageAttachment(parcel: Package, message: string, from: string) : Attachment {
        const template = new act.Template(JSON.parse(this.flwResponseFromAmTemplate));
        const payload = template.expand({
            $root: {
                ...parcel,
                message,
                from,
                customerDisplayName: `${parcel.customer} - ${parcel.customerId}`,
                viewUrl: "https://google.com"
            }
        });

        return CardFactory.adaptiveCard(payload);    
    }

    public getPackageAttachment(parcel: Package) : Attachment {
        const template = new act.Template(JSON.parse(this.flwPackageTemplate));
        const payload = template.expand({
            $root: {
                ...parcel,              
                customerDisplayName: `${parcel.customer} - ${parcel.customerId}`,
                viewUrl: "https://google.com"
            }
        });

        return CardFactory.adaptiveCard(payload);    
    }

    public getPackageMessageSentAttachment(parcel: Package, message: string) : Attachment {
        const template = new act.Template(JSON.parse(this.flwPackageMessageSentTemplate));
        const payload = template.expand({
            $root: {
                ...parcel,              
                message,
                customerDisplayName: `${parcel.customer} - ${parcel.customerId}`,
                viewUrl: "https://google.com"
            }
        });

        return CardFactory.adaptiveCard(payload);    
    }

    public getPackageMarkedAsSentAttachment(parcel: Package) : Attachment {
        const template = new act.Template(JSON.parse(this.flwPackageMarkAsSentTemplate));
        const payload = template.expand({
            $root: {
                ...parcel,        
                customerDisplayName: `${parcel.customer} - ${parcel.customerId}`,      
                viewUrl: "https://google.com"
            }
        });

        return CardFactory.adaptiveCard(payload);    
    }

    public getConsentAttachment() : Attachment {

        return CardFactory.heroCard(
            "Admin Consent",
            "This application requires a tenant administrator to consent to Graph API scopes to enable proactive messaging and app/bot install. If you are a customer admin, please click the button below to complete on-boarding.", 
            undefined,
            [
                {
                    type: ActionTypes.Signin,
                    title: "Provide Admin Consent",
                    text: "Provide Admin Consent",
                    value: `${process.env.BaseUrl}StaticViews/LoginStart.html?appId=${process.env.MicrosoftAppId}`
                }
            ]);
    }

    public getHelloAttachment(from: string) : Attachment {
        const template = new act.Template(JSON.parse(this.helloTemplate));
        const payload = template.expand({
            $root: {
                from,
                viewUrl: "https://google.com"
            }
        });

        return CardFactory.adaptiveCard(payload);  
    }

    public getErrorAttachment(error: string) : Attachment {
        const template = new act.Template(JSON.parse(this.errorTemplate));
        const payload = template.expand({
            $root: {
                error
            }
        });

        return CardFactory.adaptiveCard(payload);    
    }
}
