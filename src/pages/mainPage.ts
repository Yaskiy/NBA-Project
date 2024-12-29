import {  Page, expect, Locator } from '@playwright/test';
import { SignInpage } from './signInPage';
import { PlayerHomepage } from './playerHome';
import { MyAccountPage } from './myAccountPage';


export class Mainpage {

 protected page:Page
 constructor (page:Page) { 
   this.page = page;  
 }  



private _gameLink = (): Locator => this.page.locator('//span[text()="Games"]');
private _homeLink = (): Locator => this.page.getByRole('link', {name: 'Home'});
private _signInGoto = (): Locator => this.page.locator('//span[text()="Sign In"]');
private _signedInGoto = (): Locator => this.page.locator('button[class ="NavItem_link__ZBDtq"]');
private _signInLink = (): Locator => this.page.locator('//a[text()="Sign in with NBA ID"]');
private _mainPageLoadAssertion = (): Locator => this.page.locator('//h1[text()="Stories"]');
private _playerbar = (): Locator => this.page.locator('//span[text()="Players"]');
private _playersHomeLink = (): Locator => this.page.getByRole('link',{name: 'Players Home'});
private _clickAcceptCookies = (): Locator => this.page.getByRole('button', {name: 'I Accept'});
private _getNBALogo = (): Locator => this.page.getByRole('img', {name:'NBA Logo'})
private _myAccountLink = (): Locator => this.page.locator('//a[text()="My Account"]');


    public async LoadApplicationUnderTest(url: string): Promise<void> {
        await this.page.goto(url);
        await this.HandleCookiesMessage();
        await expect(this._getNBALogo()).toBeTruthy;
       //await expect(title).toBeTruthy();

    }
    
    public async AssertMainPageLoaded(): Promise<void> {
        await expect(this._mainPageLoadAssertion()).toBeVisible();
    }

    public async HandleCookiesMessage(): Promise <void> {
        if (this._clickAcceptCookies){
            await this._clickAcceptCookies().click();
        }
        else {    
           this.page;
        }
    }

    public async HoverGameClickHomeLink(): Promise<void> {
        await this._gameLink().hover();
        await this._homeLink().click();
    }

    public async HoverAndClickSignInLink(): Promise<void> {
        await this._signInGoto().hover()
        await this._signInLink().click()
    }

    public async HoverAndClickPlayerHomeLink(): Promise<void> {
        await this._playerbar().hover();
        await this._playersHomeLink().click();
       }

       public async HoverAndClickMyAccountInLink(): Promise<void> {
        await this._signedInGoto().nth(1).hover()
        await this._myAccountLink().click()
    }

    // public get homepage(): Homepage{
    //     return new Homepage(this.page)
    // }

    public get signInpage(): SignInpage{
        return new SignInpage(this.page)
    }

    public get playerHome(): PlayerHomepage{
        return new PlayerHomepage(this.page)
      }

    public get myAccountPage(): MyAccountPage {
        return new MyAccountPage(this.page);
    }



}
