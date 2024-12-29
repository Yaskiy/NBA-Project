import { Page, expect, Locator } from "@playwright/test";
import { PlayerHomepage } from "./playerHome";
import { Mainpage } from "./mainPage";
import { PlayerDetails } from "./player-details.dto";

export class PersonPlayerPage {

   protected page : Page
   constructor (page:Page) { 
       this.page = page  
    } 

 private _PlayerSummaryHeader1 = (): Locator => this.page.locator('.PlayerSummary_mainInnerBio__JQkoj');
 private _listPlayersDetails = (): Locator => this.page.locator('.PlayerSummary_hw__HNuGb');



public async AssertPlayerInfromation1(playerDetails: PlayerDetails): Promise<void>{

   await expect(this._PlayerSummaryHeader1()).toContainText(playerDetails.playerDetailsOne[0]); 
   await expect(this._PlayerSummaryHeader1()).toContainText(playerDetails.playerDetailsOne[1]); 
   await expect(this._PlayerSummaryHeader1()).toContainText(playerDetails.playerDetailsOne[2]);    
}
 
public async AssertPlayerDetailsAreCorrect(playerDetails: PlayerDetails): Promise<void> {
   const masterList = await this._masterPlayerDetails(playerDetails.detailsHeaders[0]);
   for (const detailHeader of playerDetails.detailsHeaders) {

      if (detailHeader === 'HEIGHT'){

         await expect(masterList.locator('.PlayerSummary_playerInfo__om2G4').filter({hasText: 'HEIGHT'}).locator
         ('.PlayerSummary_playerInfoValue__JS8_v')).toContainText(playerDetails.heightData);
      }
      
      if (detailHeader === 'WEIGHT'){

         await expect(masterList.locator('.PlayerSummary_playerInfo__om2G4').filter({hasText: 'WEIGHT'}).locator
         ('.PlayerSummary_playerInfoValue__JS8_v')).toContainText(playerDetails.weightData);
      }

      if (detailHeader === 'COUNTRY'){

         await expect(masterList.locator('.PlayerSummary_playerInfo__om2G4').filter({hasText: 'COUNTRY'}).locator
         ('.PlayerSummary_playerInfoValue__JS8_v')).toContainText(playerDetails.countryData);
      }

      if (detailHeader === 'LAST ATTENDED'){

         await expect(masterList.locator('.PlayerSummary_playerInfo__om2G4').filter({hasText: 'LAST ATTENDED'}).locator
         ('.PlayerSummary_playerInfoValue__JS8_v')).toContainText(playerDetails.lastAttendedData);
      }

      if (detailHeader === 'AGE'){

         await expect(masterList.locator('.PlayerSummary_playerInfo__om2G4').filter({hasText: 'AGE'}).locator
         ('.PlayerSummary_playerInfoValue__JS8_v')).toContainText(playerDetails.ageData);
      }

      if (detailHeader === 'BIRTHDATE'){

         await expect(masterList.locator('.PlayerSummary_playerInfo__om2G4').filter({hasText: 'BIRTHDATE'}).locator
         ('.PlayerSummary_playerInfoValue__JS8_v')).toContainText(playerDetails.birthdateData);
      }

      if (detailHeader === 'DRAFT'){

         await expect(masterList.locator('.PlayerSummary_playerInfo__om2G4').filter({hasText: 'DRAFT'}).locator
         ('.PlayerSummary_playerInfoValue__JS8_v')).toContainText(playerDetails.draftdata);
      }

      if (detailHeader === 'EXPERIENCE'){

         await expect(masterList.locator('.PlayerSummary_playerInfo__om2G4').filter({hasText: 'EXPERIENCE'}).locator
         ('.PlayerSummary_playerInfoValue__JS8_v')).toContainText(playerDetails.experiencedata);
      }


   }

   
   

}



 private async _masterPlayerDetails(itemFromList: string): Promise<Locator> {
   return await this._listPlayersDetails().filter({hasText: itemFromList});
 }

    
   

}