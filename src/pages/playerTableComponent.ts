import { Page, expect } from "playwright/test";
import { PlayerTableDto } from "./playerTable.dto";

enum Column {
  
    COUNTRY  = 1,
    Player,
    Team,
    NumberPosition, 
    HeightWeight,
    LastAttended,   
    
}

export class PlayerTableComponent {

protected page:Page
 constructor (page:Page) { 
   this.page = page;  
 }  

public async assertPlayerTableComponent(playerTableDto: PlayerTableDto): Promise<void> {

    for await (const [key, value] of playerTableDto.expectedPlayerTableValues ) {

       // const row = await this.getRowByName(key);
       //await expect(row).toBeTruthy();
    //    await this.assertcellhavetext(Column.COUNTRY, value[0], row);
    //    await this.assertcellhavetext(Column.HeightWeight, value[1], row);
    //    await this.assertcellhavetext(Column.LastAttended, value[2], row);
    //    await this.assertcellhavetext(Column.NumberPosition, value[3], row);
    //    await this.assertcellhavetext(Column.Player, value[4], row);
    //    await this.assertcellhavetext(Column.Team, value[5], row);

    }
}















}


