import {test} from '@playwright/test';
import { Mainpage } from '../src/pages/mainPage';
import { DataPage } from '../src/pages/dataPage';
import { PlayerDetails } from '../src/pages/player-details.dto';


//test.describe('Verify that a player page can successfully be navigated to', async() => {


    test('Verify that a player page ', async({page}) => {
     
    const mainPage = new Mainpage(page)
    const fillData = new DataPage().dataEntries;

   await test.step('Given the NBA website is succesfully loaded', async() => {
     await mainPage.LoadApplicationUnderTest('https://www.nba.com');  
   })

   await test.step('When i click on the Sign In Link', async() => {
    await mainPage.HoverAndClickSignInLink();
   })

   await test.step('And a user fills in the Sign In details', async() => {

   await mainPage.signInpage.AssertSignInPage();
   await mainPage.signInpage.FillInEmailField(fillData);
   await mainPage.signInpage.FillInPasswordField(fillData);

   })
   
   await test.step('And a user clicks on the sign in button', async() => {

    await mainPage.signInpage.ClickSignInBtn();
   })

   await test.step('And a user goes to My Account page', async() => {

    await mainPage.HoverAndClickMyAccountInLink();
   })

   await test.step('Then the user should be able to confirm that the sign-in is succcesfull', async() => {
     
      await mainPage.myAccountPage.ConfrimUserDataFromMyAccountPage(fillData);

   })

})

  test('Search for a Player and Assert his details are correct', async({page}) => {
      
      const mainPage = new Mainpage(page)
      const fillData = new DataPage().dataEntries;
      const fillPlayerData = new PlayerDetails().detailOnList;

      await test.step('Load the NBA website succesfully', async() => {
      await mainPage.LoadApplicationUnderTest('https://www.nba.com');  
      })

      await test.step('Navigate to the player homepage', async() =>{
      await mainPage.HoverAndClickPlayerHomeLink();
      })

      await test.step('Search a particular player and click on his profile', async() => {

        await mainPage.playerHome.SearchAPlayer(fillData);
        await mainPage.playerHome.ClickOnPlayer();
      })

      await test.step('Assert the player details are correct', async() => {
        
        await mainPage.playerHome.personPlayerHome.AssertPlayerInfromation1(fillPlayerData);
        await mainPage.playerHome.personPlayerHome.AssertPlayerDetailsAreCorrect(fillPlayerData);
      })

    });

 // });
