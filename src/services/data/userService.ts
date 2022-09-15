import { User } from "./dtos";
import { ServiceContainer } from "./serviceContainer";
import { DataService } from "./dataService";

export class UserService extends DataService<User> {

    constructor(services: ServiceContainer) {
        super("users", services)
    }

    public async expand(obj: User): Promise<User> {
        return obj;
    }

    protected decorate(obj: User): void {
        
    }

    public async getByAlias(alias: string): Promise<User | undefined> {
        const users = await this.filter(x => x.alias.toLocaleLowerCase() == alias.toLocaleLowerCase(), undefined, true);
        return users.length > 0 ? users[0] : undefined;
    }

    public async searchOne(searchText: string) : Promise<User | undefined> {
        const users = await this.search(searchText, 1);
        return users.length == 0 ? undefined : users[0];
    }

    public async search(searchText: string, maxResults: number) : Promise<User[]> {
        
        if (!searchText) {
            return await this.filter(x => true, maxResults, true);
        }

        searchText = searchText.trim();

        const id = parseInt(searchText);

        if (id) {
            const user = await this.getById(id, true);
            return user ? [user] : [];
        }

        return await this.filter(x => x.name.indexOf(searchText) > -1, maxResults, true);
    }
}


