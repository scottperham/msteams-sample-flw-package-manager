import { Package } from "./dtos";
import { DataService } from "./dataService";
import { ServiceContainer } from "./serviceContainer";


export class PackageService extends DataService<Package> {

    constructor(services: ServiceContainer) {
        super("packages", services);
    }

    protected async expand(obj: Package): Promise<Package> {
        obj.accountManager = await this.services.userService.getById(obj.accountManagerId);
        return obj;
    }

    protected decorate(obj: Package): void {
        
    }

    public async getByPackageId(id: string): Promise<Package | undefined> {
        const packages = await this.filter(x => x.packageId == id, undefined, true);
        return packages.length > 0 ? packages[0] : undefined;
    }
}
