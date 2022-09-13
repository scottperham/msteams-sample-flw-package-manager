import { PackageService } from "./packageService";
import { TemplatingService } from "./templatingService";
import { UserService } from "./userService";
import { CloudAdapter } from "botbuilder";
import { NotificationService } from "./notificationService";
import { GraphApiService } from "./graphApiService";


export class ServiceContainer {
    public userService: UserService;
    public packageService: PackageService;
    public templatingService: TemplatingService;
    public notificationService: NotificationService;
    public graphApiService: GraphApiService;

    constructor(adapter: CloudAdapter) {
        this.userService = new UserService(this);
        this.packageService = new PackageService(this);
        this.templatingService = new TemplatingService();
        this.notificationService = new NotificationService(this, adapter);
        this.graphApiService = new GraphApiService();
    }

    public loadData(sampleDataPath: string) {
        this.userService.load(sampleDataPath);
        this.packageService.load(sampleDataPath);
    }

    public loadTemplates(templatesPath: string) {
        this.templatingService.load(templatesPath);
    }
}
