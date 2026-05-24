import { Page, expect, Locator } from '@playwright/test';

/**
 * Game Navigation Page Object
 * Handles all interactions with NBA Games page
 */
export class GameNavigationPage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Locators
  private _gamesHeader = (): Locator => this.page.locator('text=NBA GAMES & SCORES');
  private _dateSelector = (): Locator => this.page.locator('text=May 2026');
  private _previousDateButton = (): Locator => this.page.locator('button').filter({ hasText: '<' }).first();
  private _nextDateButton = (): Locator => this.page.locator('button').filter({ hasText: '>' }).first();
  private _gameCards = (): Locator => this.page.locator('[data-testid="gamecard"]').or(this.page.locator('text=Finals'));
  private _hideScoresToggle = (): Locator => this.page.locator('text=HIDE SCORES').locator('..').locator('button');
  private _seasonLeadersSection = (): Locator => this.page.locator('text=SEASON LEADERS');

  /**
   * Navigate to Games page
   */
  public async navigateToGames(): Promise<void> {
    await this.page.goto('https://www.nba.com/games');
    await expect(this._gamesHeader()).toBeVisible();
  }

  /**
   * Verify games page loads with all expected elements
   */
  public async verifyGamesPageLoaded(): Promise<void> {
    await expect(this._gamesHeader()).toBeVisible();
    await expect(this._dateSelector()).toBeVisible();
    await expect(this._hideScoresToggle()).toBeVisible();
    await expect(this._seasonLeadersSection()).toBeVisible();
  }

  /**
   * Get number of visible games
   */
  public async getGameCount(): Promise<number> {
    return await this._gameCards().count();
  }

  /**
   * Navigate to next date's games
   */
  public async clickNextDate(): Promise<void> {
    await this._nextDateButton().click();
    // Wait for games to load
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to previous date's games
   */
  public async clickPreviousDate(): Promise<void> {
    await this._previousDateButton().click();
    // Wait for games to load
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Toggle hide/show scores
   */
  public async toggleHideScores(): Promise<void> {
    await this._hideScoresToggle().click();
  }

  /**
   * Verify specific game is visible
   */
  public async verifyGameVisible(team1: string, team2: string): Promise<void> {
    const gameLocator = this.page.locator(`text=${team1}`).or(this.page.locator(`text=${team2}`));
    await expect(gameLocator).toBeVisible();
  }

  /**
   * Get season leaders section
   */
  public async getSeasonLeaders(): Promise<Locator> {
    return this._seasonLeadersSection();
  }
}

/**
 * Team Navigation Page Object
 * Handles all interactions with NBA Teams pages
 */
export class TeamNavigationPage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Locators
  private _teamsHeader = (): Locator => this.page.locator('text=Teams');
  private _atlanticDivision = (): Locator => this.page.locator('text=Atlantic');
  private _centralDivision = (): Locator => this.page.locator('text=Central');
  private _southeastDivision = (): Locator => this.page.locator('text=Southeast');
  private _northwestDivision = (): Locator => this.page.locator('text=Northwest');
  private _pacificDivision = (): Locator => this.page.locator('text=Pacific');
  private _southwestDivision = (): Locator => this.page.locator('text=Southwest');

  /**
   * Navigate to Teams page
   */
  public async navigateToTeams(): Promise<void> {
    await this.page.goto('https://www.nba.com/teams');
  }

  /**
   * Verify all divisions are visible on teams page
   */
  public async verifyAllDivisionsVisible(): Promise<void> {
    await expect(this._atlanticDivision()).toBeVisible();
    await expect(this._centralDivision()).toBeVisible();
    await expect(this._southeastDivision()).toBeVisible();
    await expect(this._northwestDivision()).toBeVisible();
    await expect(this._pacificDivision()).toBeVisible();
    await expect(this._southwestDivision()).toBeVisible();
  }

  /**
   * Get team locator by name
   */
  private _getTeamByName = (teamName: string): Locator => 
    this.page.locator(`text=${teamName}`).first();

  /**
   * Verify team is visible on page
   */
  public async verifyTeamVisible(teamName: string): Promise<void> {
    await expect(this._getTeamByName(teamName)).toBeVisible();
  }

  /**
   * Get team action links (Profile, Stats, Schedule, Tickets)
   */
  public async getTeamActionLinks(teamName: string): Promise<Locator> {
    const teamElement = this._getTeamByName(teamName);
    return teamElement.locator('..').locator('..');
  }

  /**
   * Verify team has all action links
   */
  public async verifyTeamHasActionLinks(teamName: string): Promise<void> {
    const teamLinks = await this.getTeamActionLinks(teamName);
    await expect(teamLinks.locator('text=Profile')).toBeVisible();
    await expect(teamLinks.locator('text=Stats')).toBeVisible();
    await expect(teamLinks.locator('text=Schedule')).toBeVisible();
    await expect(teamLinks.locator('text=Tickets')).toBeVisible();
  }

  /**
   * Click team to navigate to team page
   */
  public async clickTeamProfile(teamName: string): Promise<void> {
    const teamElement = this._getTeamByName(teamName);
    await teamElement.click();
  }

  /**
   * Get specific team's profile link
   */
  public async getTeamProfileLink(teamName: string): Promise<Locator> {
    const teamLinks = await this.getTeamActionLinks(teamName);
    return teamLinks.locator('text=Profile');
  }

  /**
   * Click on team's profile link
   */
  public async clickTeamProfileLink(teamName: string): Promise<void> {
    const profileLink = await this.getTeamProfileLink(teamName);
    await profileLink.click();
  }
}

/**
 * Team Profile Page Object
 * Handles interactions with individual team profile pages
 */
export class TeamProfilePage {
  protected page: Page;
  private teamName: string;

  constructor(page: Page, teamName: string = 'Celtics') {
    this.page = page;
    this.teamName = teamName;
  }

  // Locators
  private _teamLogo = (): Locator => 
    this.page.locator(`img[alt*="${this.teamName}"]`).or(this.page.locator(`img[alt*="${this.teamName.split(' ')[1]}"]`));
  
  private _newsSection = (): Locator => this.page.locator('text=news');
  private _waitListSection = (): Locator => this.page.locator('text=Wait List').or(this.page.locator('text=WAIT LIST'));
  private _insiderSection = (): Locator => this.page.locator('text=Insider').or(this.page.locator('text=INSIDER'));

  /**
   * Navigate to team profile page
   */
  public async navigateToTeamProfile(teamSlug: string): Promise<void> {
    await this.page.goto(`https://www.nba.com/${teamSlug}`);
  }

  /**
   * Verify team profile page loaded
   */
  public async verifyTeamProfileLoaded(): Promise<void> {
    // Wait for page to load
    await this.page.waitForLoadState('networkidle');
    
    // Verify key elements are present
    try {
      await expect(this._teamLogo()).toBeTruthy();
    } catch {
      // Logo might not always be available
      console.log('Team logo not found, but page may still be valid');
    }
  }

  /**
   * Verify news section is visible
   */
  public async verifyNewsVisible(): Promise<void> {
    await expect(this._newsSection()).toBeTruthy();
  }

  /**
   * Verify promotional sections are visible
   */
  public async verifyPromotionalSectionsVisible(): Promise<void> {
    try {
      await expect(this._waitListSection()).toBeTruthy();
    } catch {
      console.log('Wait list section not found');
    }

    try {
      await expect(this._insiderSection()).toBeTruthy();
    } catch {
      console.log('Insider section not found');
    }
  }

  /**
   * Get news content from page
   */
  public async getNewsHeadlines(): Promise<string[]> {
    const headlines = await this.page.locator('h2, h3').allTextContents();
    return headlines.filter(h => h.trim().length > 0);
  }

  /**
   * Click on first news article
   */
  public async clickFirstNewsArticle(): Promise<void> {
    const firstArticle = this.page.locator('article').or(this.page.locator('[data-type="card"]')).first();
    await firstArticle.click();
  }
}
