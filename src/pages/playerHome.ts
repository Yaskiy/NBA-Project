import { Page, Locator } from "@playwright/test";
import { PersonPlayerPage} from "./personPlayerHome";
import { Mainpage } from "./mainPage";
import { DataPage } from "./dataPage";

export class PlayerHomepage {

    protected page : Page
    constructor (page:Page) { 
        this.page = page  
    } 

private _searchField = (): Locator => this.page.locator('input[class="Input_input__7s5ug"]')
private _clickPlayerNameLink = (): Locator => this.page.getByRole('link',{name: 'Malaki Branham'})


public async SearchAPlayer(name: DataPage): Promise<void>{
    await this._searchField().fill(name.playerName);
}

public async ClickOnPlayer(): Promise<void>{
    await this._clickPlayerNameLink().click();
}

public get personPlayerHome(): PersonPlayerPage {
    return new PersonPlayerPage(this.page)

}


}