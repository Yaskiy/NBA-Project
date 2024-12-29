export class PlayerDetails{
    
public playerDetailsOne: string[];
public detailsHeaders: string[];
public heightData: string;
public weightData: string;
public countryData: string;
public lastAttendedData: string;
public ageData: string;
public birthdateData: string;
public draftdata: string;
public experiencedata: string;




public get detailOnList(): PlayerDetails {

this.playerDetailsOne = ['San Antonio Spurs', '#22', 'Forward','Malaki Branham'];
this.detailsHeaders = ['HEIGHT', 'WEIGHT', 'COUNTRY', 'LAST ATTENDED', 'AGE', 'BIRTHDATE', 'DRAFT', 'EXPERIENCE'];
this.heightData = '(1.93m)';
this.weightData = '180lb (82kg)';
this.countryData = 'USA';
this.lastAttendedData = 'Ohio State';
this.ageData = '21 years';
this.birthdateData = 'May 12, 2003';
this.draftdata = '2022 R1 Pick 20';
this.experiencedata = '2 Years';
return this;
}

}
