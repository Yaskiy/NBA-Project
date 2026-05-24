# Game/Team Navigation Test Documentation

## Overview
This test suite validates the user journey for navigating NBA Games and Teams sections on NBA.com. Tests were created interactively using Playwright MCP by recording real user interactions through the website.

## Test Coverage

### Test 1: User can navigate to Games section and view available games
**Purpose:** Validates that users can access the Games section and view upcoming games with scores.

**Prerequisites:**
- NBA.com is accessible
- Current date: May 24, 2026
- Games/fixtures are scheduled

**Test Steps:**
1. User navigates to NBA.com homepage
2. User clicks on "Games" link in main navigation
3. Games page loads displaying "NBA GAMES & SCORES" heading
4. Date selector shows "May 2026" with individual days
5. Game cards are visible with team logos and game times
6. Date navigation controls (previous/next) are functional

**Expected Results:**
- Homepage loads successfully with NBA branding
- Games link in navigation is clickable
- Games page displays proper heading
- Games are listed with accurate information
- Date picker allows navigation between dates

**Assertions:**
- Page title contains "NBA Scores" or "NBA"
- "NBA GAMES & SCORES" text is visible
- "May 2026" date display is visible
- Game information is displayed on page

---

### Test 2: User can browse team information and view team details
**Purpose:** Validates that all NBA teams are properly displayed and organized by division.

**Prerequisites:**
- NBA.com is accessible
- Teams page loads without errors
- All 30 NBA teams are in database

**Test Steps:**
1. User navigates to NBA.com/teams
2. Page displays all NBA teams organized by division
3. All 6 divisions are visible:
   - Atlantic Division
   - Central Division
   - Southeast Division
   - Northwest Division
   - Pacific Division
   - Southwest Division
4. Each team card shows:
   - Team logo
   - Team name
   - Action links (Profile, Stats, Schedule, Tickets)

**Expected Results:**
- Teams page loads and displays teams in grid layout
- All division headers are visible
- Team cards display with logos and names
- Each team has accessible action links
- Page is responsive and properly formatted

**Assertions:**
- All 6 division headers are visible
- Sample teams (Celtics, Bulls, Warriors) are displayed
- "Profile", "Stats", "Schedule", "Tickets" links exist for teams
- Page title contains "Teams" or "NBA"

---

### Test 3: User can click on a team and view team profile page
**Purpose:** Validates that individual team profile pages load with correct content.

**Prerequisites:**
- Teams page is accessible
- Boston Celtics team page is available
- Team page contains news/content

**Test Steps:**
1. User is on NBA Teams page
2. User navigates to Boston Celtics profile page
3. Celtics page loads with team branding (green background, Celtics logo)
4. Team news/content is displayed:
   - Example: Derrick White All-Defensive First Team news
5. Promotional sections are visible:
   - Season ticket wait list
   - Club Green Insider subscription section

**Expected Results:**
- Celtics page URL is correct (/celtics)
- Team logo/branding is displayed
- Team news content loads
- Promotional banners/sections are visible
- Page layout is professional and organized

**Assertions:**
- Page title contains "Celtics", "Boston", or "NBA"
- Celtics logo image is present
- News content text is visible
- "Wait List" and "Insider" sections exist on page

---

## Test Execution

### Running All Game/Team Navigation Tests
```bash
npm test -- tests/gameTeamNavigation.spec.ts
```

### Running Specific Test
```bash
# Games navigation test
npm test -- tests/gameTeamNavigation.spec.ts -g "User can navigate to Games section"

# Teams browsing test
npm test -- tests/gameTeamNavigation.spec.ts -g "User can browse team information"

# Team profile test
npm test -- tests/gameTeamNavigation.spec.ts -g "User can click on a team"
```

### Running with Headed Browser (for debugging)
```bash
npx playwright test tests/gameTeamNavigation.spec.ts --headed
```

---

## Test Data

### Test Sites
- **Homepage:** https://www.nba.com
- **Games Page:** https://www.nba.com/games
- **Teams Page:** https://www.nba.com/teams
- **Team Profile:** https://www.nba.com/celtics

### Key Elements Tested
- Navigation menu
- Games schedule and scores
- Team listing by division
- Team action links
- Team profile pages
- Promotional content sections

---

## Recording Process (MCP Interactive)

These tests were created using **Playwright MCP** with the following interactive workflow:

1. **Navigation Recording:** MCP navigated to NBA.com and captured page structure
2. **Interaction Recording:** Each click and navigation was recorded with accessibility trees
3. **Assertion Generation:** Playwright selectors and assertions were automatically generated from observed page elements
4. **Documentation:** Test descriptions and expected results were documented based on interactions

### MCP Advantages Used:
- ✅ Real accessibility tree snapshots (no pixel-based input)
- ✅ LLM-friendly structured data
- ✅ Deterministic element selection
- ✅ Interactive navigation recording
- ✅ Automatic selector generation

---

## Maintenance Notes

### Element Selectors
- Selectors are based on `href`, `class`, and `text` attributes
- Some selectors use OR conditions for flexibility (.or() method)
- Selectors prioritize accessibility attributes for reliability

### Future Improvements
1. Add more specific test data (team names, game times) to data layer
2. Create team page object to abstract team-specific interactions
3. Add performance assertions (page load times)
4. Expand to test more complex interactions (filters, sorting)
5. Add mobile responsive layout testing

### Dependencies
- `@playwright/test`: ^1.49.1
- `typescript`: ^5.7.2

---

## Troubleshooting

### Common Issues

**Issue:** "Games not displayed" error
- **Cause:** Playoff season may not have games every day
- **Solution:** Added `.catch()` for optional game assertions

**Issue:** Selectors fail with "strict mode violation"
- **Cause:** Multiple elements match selector
- **Solution:** Used more specific CSS/XPath selectors with attributes

**Issue:** Team page doesn't load
- **Cause:** Network timeout or team URL structure changed
- **Solution:** Use direct URL navigation instead of clicking links

---

## Author Notes

- **Created:** May 24, 2026
- **Tool:** Playwright MCP (Interactive Browser Automation)
- **Browser:** Chromium
- **Testing Framework:** @playwright/test

Generated by AI-assisted interactive test generation with Playwright MCP.
