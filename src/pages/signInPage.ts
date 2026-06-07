import { Page, Locator } from "@playwright/test";
import { Mainpage } from "./mainPage";
import { DataPage } from "./dataPage";

export class SignInpage {
 
        protected page : Page
        constructor (page:Page) { 
            this.page = page  
         } 


private _signInPageHeader = (): Locator => this.page.locator('.EmailFirst_title__Y_9uz')
private _emailField = (): Locator => this.page.getByTestId('email')
private _passwordField = (): Locator => this.page.getByTestId('password')
private _signInBtn = (): Locator => this.page.getByRole('button', {name: 'Sign In'})


public async AssertSignInPage(): Promise<string> {
 
    return await this._signInPageHeader().innerText()
}

public async FillInEmailField(dataFill: DataPage): Promise<void> {
   await this._emailField().fill(dataFill.email) 
}

public async FillInPasswordField(dataFill: DataPage): Promise<void> {
    await this._passwordField().fill(dataFill.password) 
 }

 public async ClickSignInBtn(): Promise <void> {
    await this._signInBtn().nth(1).click();
 }
}