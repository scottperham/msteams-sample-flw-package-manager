import { Package } from "./dtos";
import * as fs from 'fs';
import * as path from 'path';
import * as act from 'adaptivecards-templating';
import { Attachment, CardFactory } from "botbuilder";


export class TemplatingService {

    flwPackageTemplate: string = "";
    flwPackageMessageSentTemplate: string = "";
    flwPackageMarkAsSentTemplate: string = "";
    errorTemplate: string = "";
    templatesPath: string = "";

    public load(templatesPath: string) {
        this.templatesPath = templatesPath;
        this.flwPackageTemplate = fs.readFileSync(path.join(templatesPath, "flwcard.json")).toString();
        this.flwPackageMessageSentTemplate = fs.readFileSync(path.join(templatesPath, "flwcard-update-messagecard.json")).toString();
        this.flwPackageMarkAsSentTemplate = fs.readFileSync(path.join(templatesPath, "flwcard-update-markedassent.json")).toString();
        this.errorTemplate = fs.readFileSync(path.join(templatesPath, "errorcard.json")).toString();
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
