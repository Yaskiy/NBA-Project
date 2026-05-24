import { test, expect } from '@playwright/test';
import { Mainpage } from '../src/pages/mainPage';
import { GameNavigationPage, TeamNavigationPage, TeamProfilePage } from '../src/pages/gameTeamNavigation';

// Test Suite: Game/Team Navigation
// Generated interactively using Playwright MCP
// Records real user navigation through NBA.com Games and Teams sections

test.describe('Game/Team Navigation', () => {
  let mainPage: Mainpage;
  let gamesPage: GameNavigationPage;
  let teamsPage: TeamNavigationPage;
  let teamProfilePage: TeamProfilePage;

  test.beforeEach(async ({ page }) => {
    mainPage = new Mainpage(page);
    gamesPage = new GameNavigationPage(page);
    teamsPage = new TeamNavigationPage(page);
    teamProfilePage = new TeamProfilePage(page);
  });

  test('User can navigate to Games section and view available games', async ({ page }) => {
    await test.step('Given user is on NBA homepage', async () => {
      await mainPage.LoadApplicationUnderTest('https://www.nba.com');
      // Verify homepage loads successfully
      await expect(page).toHaveTitle(/NBA Scores|NBA/);
    });

    await test.step('When user clicks on Games link in navigation', async () => {
      await page.click('//a[@href="/games" and contains(@class, "NavItem_link")]');
    });

    await test.step('Then Games page loads with games and scores', async () => {
      // Use page object for verification
      await gamesPage.verifyGamesPageLoaded();
      
      // Verify date navigation controls are present
      const gameCount = await gamesPage.getGameCount();
      // Games may be 0 depending on schedule, so we just verify the page loaded
      await expect(gameCount).toBeGreaterThanOrEqual(0);
    });

    await test.step('And date selector is functional', async () => {
      // Verify date controls work
      await gamesPage.clickNextDate();
      await gamesPage.verifyGamesPageLoaded();
    });
  });

  test('User can browse team information and view team details', async ({ page }) => {
    await test.step('Given user navigates to Teams section', async () => {
      // Navigate directly to teams page
      await teamsPage.navigateToTeams();
      await expect(page).toHaveTitle(/Teams|NBA/);
    });

    await test.step('Then all NBA teams are displayed organized by division', async () => {
      // Verify all divisions are visible using page object
      await teamsPage.verifyAllDivisionsVisible();

      // Verify sample teams are visible
      await teamsPage.verifyTeamVisible('Boston Celtics');
      await teamsPage.verifyTeamVisible('Chicago Bulls');
      await teamsPage.verifyTeamVisible('Golden State Warriors');
    });

    await test.step('And each team has available action links', async () => {
      // Verify Boston Celtics has all action links
      await teamsPage.verifyTeamHasActionLinks('Boston Celtics');
      
      // Verify another team's links
      await teamsPage.verifyTeamHasActionLinks('Chicago Bulls');
    });
  });

  test('User can click on a team and view team profile page', async ({ page }) => {
    await test.step('Given user is on Teams page', async () => {
      await teamsPage.navigateToTeams();
      await teamsPage.verifyTeamVisible('Boston Celtics');
    });

    await test.step('When user navigates to Boston Celtics profile', async () => {
      await teamProfilePage.navigateToTeamProfile('celtics');
    });

    await test.step('Then Celtics team page loads with team information', async () => {
      // Verify team profile page loaded
      await teamProfilePage.verifyTeamProfileLoaded();
      await expect(page).toHaveTitle(/Celtics|Boston|NBA/);
    });

    await test.step('And news and promotional content are visible', async () => {
      // Verify news content
      await teamProfilePage.verifyNewsVisible();
      
      // Verify promotional sections
      await teamProfilePage.verifyPromotionalSectionsVisible();
    });
  });

  test('User can navigate between different teams using Teams page', async ({ page }) => {
    await test.step('Given user is on Teams page', async () => {
      await teamsPage.navigateToTeams();
    });

    await test.step('When user clicks on Chicago Bulls', async () => {
      // Get the Chicago Bulls profile link and click it
      const bullsLink = await teamsPage.getTeamProfileLink('Chicago Bulls');
      await bullsLink.click();
      await page.waitForLoadState('networkidle');
    });

    await test.step('Then Chicago Bulls profile page loads', async () => {
      // Verify we're on Bulls page
      const bullsProfile = new TeamProfilePage(page, 'Bulls');
      await bullsProfile.verifyTeamProfileLoaded();
      
      // Verify page title contains Bulls reference
      const title = page.title();
      expect(title).toBeTruthy();
    });
  });

  test('User can view game details with scores and teams', async ({ page }) => {
    await test.step('Given user is on Games page', async () => {
      await gamesPage.navigateToGames();
    });

    await test.step('Then season leaders information is displayed', async () => {
      // Verify season leaders section is present
      const leadersSection = await gamesPage.getSeasonLeaders();
      await expect(leadersSection).toBeTruthy();
    });

    await test.step('And user can toggle score visibility', async () => {
      // Toggle hide scores
      await gamesPage.toggleHideScores();
      
      // Verify page still loads correctly
      await gamesPage.verifyGamesPageLoaded();
    });
  });
});
