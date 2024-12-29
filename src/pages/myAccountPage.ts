import { Page, Locator, expect } from "@playwright/test";
import { SignInpage } from "./signInPage";
import { DataPage } from "./dataPage";

export class MyAccountPage extends SignInpage {

  constructor (page:Page){ 
    super(page)
       
     } 


 private _myAccountPageInfo = (): Locator => this.page.getByTestId('test-id-31');




 public async ConfrimUserDataFromMyAccountPage(pageInfo : DataPage): Promise<void>{
  await expect(this._myAccountPageInfo()).toContainText(pageInfo.welcomeMsg);
  await expect(this._myAccountPageInfo()).toContainText(pageInfo.membershipDate);
  await expect(this._myAccountPageInfo()).toContainText(pageInfo.email);
 }

}