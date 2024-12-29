export class DataPage{

public playerName: string;
public email: string;
public password: string;
public welcomeMsg: string;
public membershipDate: string;
public playerDetailsOne: string[];
public playerDetailsTwo: string[];




public get dataEntries(): DataPage {

 this.playerName = 'Malaki Branham';
 this.email = 'yaqubogun@gmail.com';
 this.password = 'Testing12';
 this.welcomeMsg = 'WELCOME, YAKUBU';
 this.membershipDate = 'December 2024';
 this.playerDetailsOne = ['San Antonio Spurs', '#22', 'Forward','Malaki Branham'];
 this.playerDetailsTwo = ['']

 return this

}

}