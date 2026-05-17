export class PlayerTableDto {
    
    public expectedPlayerTableValues = new Map<string, string[]>();

    public get expectedPlayerValuesForAllPlayers(): PlayerTableDto {
        this.expectedPlayerTableValues.set('Nigeria', ['Precious Achiuwa', 'NYK', '5', 'F', '6-8', '243 lbs', 'Memphis'])
        this.expectedPlayerTableValues.set('New Zealand', ['Steven Adams', 'HOU', '12', 'C', '6-11', '265 lbs', 'Pittsburgh'])
        this.expectedPlayerTableValues.set('USA', ['Bam Adebayo', 'MIA', '13', 'C-F', '6-9', '255 lbs', 'Kentucky'])
        this.expectedPlayerTableValues.set('Spain', ['Santi Aldama', 'MEM', '7', 'F-C', '7-0', '215 lbs', 'Loyola-Maryland'])
        this.expectedPlayerTableValues.set('Canada', ['Nickeil Alexander-Walker', 'MIN', '9', 'G', '6-5', '205 lbs', 'Virginia Tech'])
        return this;
    }
}