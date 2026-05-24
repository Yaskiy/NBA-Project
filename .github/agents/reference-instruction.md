# NBA Playwright Framework - Reference Instructions

This document provides comprehensive guidance for AI agents and developers adding new code to the NBA Playwright test framework. It covers architecture patterns, naming conventions, code structure, and integration guidelines.

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Naming Conventions](#naming-conventions)
3. [Page Object Standards](#page-object-standards)
4. [Locator Strategies](#locator-strategies)
5. [DTO/Data Patterns](#dtoedata-patterns)
6. [Test File Structure](#test-file-structure)
7. [Navigation & Page Composition](#navigation--page-composition)
8. [Integration Flow](#integration-flow)
9. [Code Templates](#code-templates)
10. [Best Practices](#best-practices)
11. [Known Issues & Fixes](#known-issues--fixes)
12. [Configuration Reference](#configuration-reference)
13. [How-To Examples](#how-to-examples)

---

## Architecture Overview

### Pattern: Page Object Model (POM) with Dependency Injection

The framework implements **Page Object Model** with **dependency injection** to achieve:
- **Separation of concerns**: Test logic separate from UI interaction logic
- **Reusability**: Page objects shared across multiple test cases
- **Maintainability**: Locator changes isolated to page object files
- **Testability**: Easy to mock and test in isolation

### Core Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Test Files (tests/*.spec.ts)             │
│         Define BDD test steps and assertions                │
└─────────────────────┬───────────────────────────────────────┘
                      │ instantiate & chain
┌─────────────────────▼───────────────────────────────────────┐
│              Page Objects (src/pages/*.ts)                  │
│   - Constructor: accepts Page (dependency injection)        │
│   - Locators: private methods returning Locators            │
│   - Actions: public methods for user interactions           │
│   - Assertions: public methods for verification             │
│   - Navigation: getters returning other page objects        │
└─────────────────────┬───────────────────────────────────────┘
                      │ instantiate & populate
┌─────────────────────▼───────────────────────────────────────┐
│              DTOs (src/pages/*.dto.ts)                      │
│   - Test data holders with getter-based initialization      │
│   - No UI interaction logic                                 │
└─────────────────────────────────────────────────────────────┘
```

### Design Principles

1. **Dependency Injection**: All page objects receive `Page` via constructor
   ```typescript
   constructor(page: Page) {
       this.page = page;
   }
   ```

2. **Lazy Locator Evaluation**: Locators are private methods returning Locators
   - Avoids stale element references
   - Allows dynamic locator updates
   ```typescript
   private _emailField = (): Locator => this.page.getByTestId('email');
   ```

3. **Fluent Navigation**: Page objects chain via getter methods
   ```typescript
   mainPage.signInpage.AssertSignInPage()
   ```

4. **Composition over Inheritance**: Prefer returning new page instances via getters
   - Exception: MyAccountPage extends SignInpage (reuses form methods)

---

## Naming Conventions

### Class Names: PascalCase with Full Words

**Rule**: Use full PascalCase (capitalize each word, no abbreviations)

| Example | ✓ Correct | ✗ Incorrect | Reason |
|---------|-----------|-------------|--------|
| Main page | `MainPage` | `Mainpage` | Capitalize "Page" |
| Sign in page | `SignInPage` | `SignInpage` | Capitalize "Page" |
| Player home page | `PlayerHomePage` | `PlayerHomepage` | Capitalize "Page" |
| Person player page | `PersonPlayerPage` | `PersonPlayerpage` | Already correct |
| Data Transfer Object | `PlayerTableDto` | `PlayerTableDTO` | Use "Dto" not "DTO" |

**Notes**:
- Current codebase has inconsistencies: `Mainpage`, `SignInpage`, `PlayerHomepage` should be corrected
- Component classes (e.g., `PlayerTableComponent`) use full word
- DTO classes always use `Dto` suffix in PascalCase

### Method Names: Action-First with PascalCase

**Rule**: Public methods start with action verbs in PascalCase

#### Action Methods (User Interactions)
```typescript
// Clicks
ClickOnPlayer()
ClickSignInBtn()
HoverAndClickSignInLink()

// Form interactions
FillInEmailField(data)
FillInPasswordField(data)
SearchAPlayer(playerName)

// Navigation
LoadApplicationUnderTest(url)

// Assertions/Verification
AssertMainPageLoaded()
AssertSignInPage()
AssertPlayerInfromation1()  // Note: Current codebase has typo "Infromation"
ConfrimUserDataFromMyAccountPage()  // Note: Current codebase has typo "Confrim"
```

**Verb Categories**:
- **Clicks**: `Click*`, `Hover*`, `HoverAndClick*`
- **Forms**: `FillIn*`, `Enter*`, `Select*`
- **Navigation**: `Load*`, `Navigate*`, `Go*`
- **Assertions**: `Assert*`, `Confirm*`, `Verify*`

**Note**: New methods should correct typos (`Infromation` → `Information`, `Confrim` → `Confirm`)

### Private Method Names: camelCase with Leading Underscore

**Rule**: Locator methods use `_elementName()` pattern

```typescript
private _emailField = (): Locator => this.page.getByTestId('email');
private _gameLink = (): Locator => this.page.locator('//span[text()="Games"]');
private _signInGoto = (): Locator => this.page.locator('//span[text()="Sign In"]');
private _masterPlayerDetails = (): Locator => this.page.locator('.PlayerSummary_masterInnerBio__JQkoj');
```

**Pattern**: `_[descriptive_name]` where descriptive_name is camelCase, concise and accurate

### Property Names: camelCase

```typescript
// Simple properties
playerName: string
email: string
password: string
welcomeMsg: string

// Composite properties
playerDetailsOne: string[]
detailsHeaders: string[]
heightData: string
ageData: string
lastAttendedData: string
expectedPlayerTableValues: Map<string, string[]>
```

### Enum Names: UPPER_CASE for Values

**Rule**: Enum names are PascalCase; enum values are either UPPER_CASE or PascalCase depending on semantics

```typescript
enum Column {
    COUNTRY = 1,
    Player,
    Team,
    NumberPosition,
    HeightWeight,
    LastAttended
}
```

**Convention**: Numeric enums use UPPER_CASE (enum value names), numeric values auto-increment starting from 1

### Test Step Descriptions: BDD Format (Given/When/And/Then)

**Rule**: Use Gherkin-style Given/When/And/Then for clarity

```typescript
await test.step('Given the NBA website is successfully loaded', async() => {
    await mainPage.LoadApplicationUnderTest('https://www.nba.com');
})

await test.step('When I click on the Sign In Link', async() => {
    await mainPage.HoverAndClickSignInLink();
})

await test.step('And a user fills in the Sign In details', async() => {
    await mainPage.signInpage.FillInEmailField(fillData);
    await mainPage.signInpage.FillInPasswordField(fillData);
})

await test.step('Then the user should see player details', async() => {
    await mainPage.playerHome.personPlayerHome.AssertPlayerDetailsAreCorrect(playerDetails);
})
```

**Structure**: `[Given|When|And|Then] [subject] [action]`

---

## Page Object Standards

### Class Structure Template

```typescript
import { Page, Locator, expect } from '@playwright/test';

export class PageNamePage {
    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // ==================== LOCATORS (Private) ====================
    private _locatorName = (): Locator => this.page.locator('selector');
    private _anotherElement = (): Locator => this.page.getByRole('button', { name: 'Click me' });

    // ==================== ACTIONS (Public) ====================
    public async ActionName(): Promise<void> {
        await this._locatorName().click();
    }

    public async ActionWithData(data: any): Promise<void> {
        await this._anotherElement().fill(data.value);
    }

    // ==================== ASSERTIONS (Public) ====================
    public async AssertElementVisible(): Promise<void> {
        await expect(this._locatorName()).toBeVisible();
    }

    public async AssertElementContainsText(text: string): Promise<void> {
        await expect(this._locatorName()).toContainText(text);
    }

    // ==================== PAGE NAVIGATION (Public Getters) ====================
    public get nextPageObject(): NextPagePage {
        return new NextPagePage(this.page);
    }
}
```

### Locator Definition Rules

**Rule 1**: Define locators as private methods returning `Locator`
```typescript
private _emailField = (): Locator => this.page.getByTestId('email');
```

**Rule 2**: Never call locators directly; always use methods
```typescript
// ✓ Correct
await this._emailField().fill(email);

// ✗ Wrong
await this.page.getByTestId('email').fill(email);
```

**Rule 3**: Use lazy evaluation to prevent stale elements
- Calling `_locatorName()` each time gets a fresh Locator reference
- Avoids "element is not attached to DOM" errors

### Constructor Pattern

**All page objects** must follow this exact pattern:

```typescript
protected page: Page;

constructor(page: Page) {
    this.page = page;
}
```

**Notes**:
- `page` property is `protected` (not `private`) to allow subclasses to access it
- Constructor signature is uniform across all page objects
- No initialization logic in constructor; use `LoadApplicationUnderTest()` or setup steps instead

### Method Visibility Rules

| Method Type | Visibility | Purpose |
|-------------|-----------|---------|
| Locator getters | `private` | Return Locators for internal use |
| User action methods | `public` | Click, fill, navigate, etc. |
| Assertion methods | `public` | Verify element state/content |
| Page navigation getters | `public` | Return new page object instances |
| Helper methods (rare) | `private` | Internal helper logic |

### Return Types

```typescript
// Actions return Promise<void>
public async ClickButton(): Promise<void> {
    await this._button().click();
}

// Assertions return Promise<void>
public async AssertHeaderVisible(): Promise<void> {
    await expect(this._header()).toBeVisible();
}

// Getters return Page Object or Locator
public get signInPage(): SignInPage {
    return new SignInPage(this.page);
}

private _emailField = (): Locator => this.page.getByTestId('email');
```

### Type Safety

**Required**:
- All methods must have explicit return types
- All parameters must have type annotations
- Prefer specific types over `any`

```typescript
// ✓ Good
public async SearchPlayer(playerName: string): Promise<void> {
    await this._searchField().fill(playerName);
}

// ✗ Bad
public async SearchPlayer(playerName: any) {
    await this._searchField().fill(playerName);
}
```

---

## Locator Strategies

This framework uses **five primary locator strategies**. Choose based on context and robustness.

### 1. Role-Based Locators (Most Recommended)

**Advantage**: Aligns with accessibility API; most resilient to DOM changes
**Pattern**: `this.page.getByRole(role, options)`

```typescript
// Button
private _signInButton = (): Locator => this.page.getByRole('button', { name: 'Sign In' });

// Link
private _homeLink = (): Locator => this.page.getByRole('link', { name: 'Home' });

// Input field
private _emailInput = (): Locator => this.page.getByRole('textbox', { name: 'Email' });

// Checkbox
private _agreeCheckbox = (): Locator => this.page.getByRole('checkbox', { name: 'I Agree' });
```

**When to use**: When the element has an accessible role and label

### 2. TestId Locators (Recommended for Complex UIs)

**Advantage**: Explicit, stable, easy for developers to manage
**Pattern**: `this.page.getByTestId(testId)`

```typescript
private _emailField = (): Locator => this.page.getByTestId('email');
private _passwordField = (): Locator => this.page.getByTestId('password');
private _playerSearchInput = (): Locator => this.page.getByTestId('player-search');
```

**HTML attribute**: `data-testid="email"`

**When to use**: When UI has explicit test IDs; strongly recommended for new code

### 3. XPath Locators (Use Carefully)

**Advantage**: Powerful for complex selections
**Disadvantage**: Brittle; breaks easily with DOM changes
**Pattern**: `this.page.locator('//xpath/expression')`

```typescript
private _gameLink = (): Locator => this.page.locator('//span[text()="Games"]');
private _playerRow = (): Locator => this.page.locator(`//tr[contains(., '${playerName}')]`);
```

**When to use**:
- Only when role-based or TestId not available
- For dynamic content matching specific text
- Keep XPath simple and readable

**Avoid**:
- Deeply nested XPath (e.g., `/html/body/div[1]/div[2]/...`)
- Fragile position-based selectors (`[1]`, `[2]`)
- Complex logic; split into multiple locators instead

### 4. CSS Class Locators (Legacy)

**Advantage**: Works for styled elements
**Disadvantage**: Breaks when CSS classes change
**Pattern**: `this.page.locator('.ClassName')`

```typescript
private _masterPlayerDetails = (): Locator => 
    this.page.locator('.PlayerSummary_masterInnerBio__JQkoj');
```

**When to use**:
- Only when other strategies unavailable
- For styled containers with stable class names
- Avoid component-scoped CSS module names (brittle)

### 5. Chained/Filtered Locators (For Complex Structures)

**Advantage**: Combines multiple strategies for precise targeting
**Pattern**: `locator.filter({...}).locator(...)`

```typescript
// From personPlayerHome.ts - find height data within player info
const heightData = this.page.locator('.PlayerSummary_playerInfo__om2G4')
    .filter({hasText: 'HEIGHT'})
    .locator('.PlayerSummary_playerInfoValue__JS8_v');

// Usage
private _heightValue = (): Locator => 
    this.page.locator('.PlayerSummary_masterInnerBio__JQkoj')
        .locator('.PlayerSummary_playerInfo__om2G4')
        .filter({hasText: 'HEIGHT'})
        .locator('.PlayerSummary_playerInfoValue__JS8_v');
```

**When to use**: When element is deeply nested or requires multiple filters

### Locator Selection Decision Tree

```
START: Need a locator
│
├─ Does element have accessible role? (button, link, input, etc.)
│  └─ YES → Use getByRole() ✓ RECOMMENDED
│
├─ Does element have data-testid?
│  └─ YES → Use getByTestId() ✓ RECOMMENDED
│
├─ Does element have visible text I can match?
│  └─ YES → Use getByText() or XPath with text()
│
├─ Is element a named form control?
│  └─ YES → Use getByLabel()
│
├─ Does element have placeholder text?
│  └─ YES → Use getByPlaceholder()
│
└─ Otherwise → Use XPath or CSS (least preferred)
```

---

## DTO/Data Patterns

Data Transfer Objects (DTOs) and Data classes hold test data without UI interaction logic. Three patterns are used:

### Pattern 1: Map-Based DTO with Fluent Getters

**File**: `src/pages/playerTable.dto.ts`

```typescript
import { PlayerTableDto } from './playerTable.dto';

export class PlayerTableDto {
    // Storage: Map of country -> array of player info
    public expectedPlayerTableValues = new Map<string, string[]>();

    // Fluent getter: populates data and returns self
    public get expectedPlayerValuesForAllPlayers(): PlayerTableDto {
        this.expectedPlayerTableValues.set('Nigeria', [
            'Precious Achiuwa',
            'NYK',
            '5',
            'F',
            '6\'8"',
            '225 lbs'
        ]);
        this.expectedPlayerTableValues.set('USA', [
            'LeBron James',
            'LAL',
            '23',
            'F',
            '6\'9"',
            '250 lbs'
        ]);
        return this;
    }

    // Usage in test:
    // const tableData = new PlayerTableDto().expectedPlayerValuesForAllPlayers;
    // tableData.expectedPlayerTableValues.get('Nigeria')
}
```

**Characteristics**:
- Stores data in `Map<string, string[]>` or similar structure
- Getter methods return `this` for fluent API
- Call getter to populate; access properties afterward

### Pattern 2: Property-Based DTO with Getters

**File**: `src/pages/player-details.dto.ts`

```typescript
export class PlayerDetails {
    // Public properties (populated by getters)
    public playerDetailsOne: string[];
    public detailsHeaders: string[];
    public heightData: string;
    public ageData: string;
    public weightData: string;
    public countryData: string;
    public draftYearData: string;
    public lastAttendedData: string;

    // Fluent getter: initializes and returns self
    public get detailOnList(): PlayerDetails {
        this.playerDetailsOne = [
            'San Antonio Spurs',
            '#22',
            'Forward',
            'Malaki Branham'
        ];
        this.detailsHeaders = [
            'HEIGHT',
            'WEIGHT',
            'COUNTRY',
            'DRAFT',
            'LAST ATTENDED'
        ];
        this.heightData = '6\'7"';
        this.ageData = '20 years old';
        this.weightData = '210 lbs';
        this.countryData = 'USA';
        this.draftYearData = '2022';
        this.lastAttendedData = 'San Diego State University';
        return this;
    }

    // Usage in test:
    // const playerData = new PlayerDetails().detailOnList;
    // assert playerData.heightData === '6\'7"'
}
```

**Characteristics**:
- Properties are public and simple types
- Getters initialize all properties and return `this`
- More direct property access than Pattern 1

### Pattern 3: Simple Data Class

**File**: `src/pages/dataPage.ts`

```typescript
export class DataPage {
    // Public properties
    public playerName: string;
    public email: string;
    public password: string;

    // Fluent getter
    public get dataEntries(): DataPage {
        this.playerName = 'Malaki Branham';
        this.email = 'yaqubogun@gmail.com';
        this.password = 'Testing12';
        return this;
    }

    // Usage in test:
    // const fillData = new DataPage().dataEntries;
    // mainPage.signInpage.FillInEmailField(fillData);
}
```

**Characteristics**:
- Simplest pattern for basic data
- Properties are public and optional
- Single getter method to populate

### DTO Implementation Rules

**Rule 1**: Define data with getter fluent pattern
```typescript
// ✓ Correct
const data = new PlayerDetails().detailOnList;

// ✗ Wrong
const data = new PlayerDetails();
data.detailOnList; // Getter called but result discarded
```

**Rule 2**: Getters return `this` for chaining
```typescript
public get detailOnList(): PlayerDetails {
    this.playerDetailsOne = [...];
    // ... other assignments
    return this;
}
```

**Rule 3**: Name getters descriptively
- `expectedPlayerValuesForAllPlayers` → returns data for all players
- `detailOnList` → returns detail view data
- `dataEntries` → returns basic login data

**Rule 4**: No business logic in DTOs
- Only data storage and initialization
- No assertions, no UI interaction

### Choosing Between Patterns

| Pattern | Use Case | Example |
|---------|----------|---------|
| Map-Based (Pattern 1) | Multiple sets of varied data, key-value pairs | PlayerTableDto (multiple countries) |
| Property-Based (Pattern 2) | Large flat dataset with many properties | PlayerDetails (8+ properties) |
| Simple Class (Pattern 3) | Small, uniform dataset | DataPage (3 simple strings) |

---

## Test File Structure

### Test Organization: BDD with test.step()

**File**: `tests/playersJourney.spec.ts`

All tests must:
1. Import required modules and page objects
2. Use Playwright's `test()` fixture
3. Organize steps with BDD-style `test.step()` blocks
4. Instantiate page objects in test body (not in hooks)
5. Use DTOs for data population

```typescript
import { test, expect, Page } from '@playwright/test';
import { Mainpage } from '../src/pages/mainPage';
import { DataPage } from '../src/pages/dataPage';
import { PlayerDetails } from '../src/pages/player-details.dto';

test.describe('NBA Players Journey', () => {
    // NO beforeEach/afterEach setup; Playwright fixtures handle it
    
    test('Verify that a player page displays correct information', async({ page }) => {
        // STEP 1: Instantiate page objects
        const mainPage = new Mainpage(page);
        const fillData = new DataPage().dataEntries;

        // STEP 2: Given - Load application
        await test.step('Given the NBA website is successfully loaded', async() => {
            await mainPage.LoadApplicationUnderTest('https://www.nba.com');
        });

        // STEP 3: When - Initial interaction
        await test.step('When I click on the Sign In Link', async() => {
            await mainPage.HoverAndClickSignInLink();
        });

        // STEP 4: And - Intermediate steps
        await test.step('And a user fills in the Sign In details', async() => {
            await mainPage.signInpage.AssertSignInPage();
            await mainPage.signInpage.FillInEmailField(fillData);
            await mainPage.signInpage.FillInPasswordField(fillData);
            await mainPage.signInpage.ClickSignInBtn();
        });

        // STEP 5: Then - Assertions
        await test.step('Then the user should see My Account page', async() => {
            await mainPage.myAccountPage.ConfrimUserDataFromMyAccountPage(fillData);
        });
    });

    test('Verify player details are displayed correctly', async({ page }) => {
        const mainPage = new Mainpage(page);
        const fillData = new DataPage().dataEntries;
        const playerDetails = new PlayerDetails().detailOnList;

        await test.step('Given user is logged in and on Players page', async() => {
            await mainPage.LoadApplicationUnderTest('https://www.nba.com');
            await mainPage.HoverAndClickSignInLink();
            await mainPage.signInpage.FillInEmailField(fillData);
            await mainPage.signInpage.FillInPasswordField(fillData);
            await mainPage.signInpage.ClickSignInBtn();
            await mainPage.HoverAndClickPlayerHomeLink();
        });

        await test.step('When user searches for a player', async() => {
            await mainPage.playerHome.SearchAPlayer(fillData);
            await mainPage.playerHome.ClickOnPlayer();
        });

        await test.step('Then player details match expected data', async() => {
            await mainPage.playerHome.personPlayerHome
                .AssertPlayerInfromation1();
            await mainPage.playerHome.personPlayerHome
                .AssertPlayerDetailsAreCorrect(playerDetails);
        });
    });
});
```

### Fixture Usage

**Rule**: Use Playwright's `page` fixture, not custom setup

```typescript
// ✓ Correct - use Playwright fixture
test('Example', async({ page }) => {
    const mainPage = new Mainpage(page);
});

// ✗ Wrong - don't create custom hooks
test.beforeEach(async({ page }) => {
    const mainPage = new Mainpage(page);
    // This creates unclear setup hidden from test
});
```

### Data Instantiation Pattern

```typescript
// ALWAYS instantiate DTOs with fluent getter
const fillData = new DataPage().dataEntries;
const playerData = new PlayerDetails().detailOnList;

// Pass to page methods
await mainPage.signInpage.FillInEmailField(fillData);
await mainPage.playerHome.personPlayerHome.AssertPlayerDetailsAreCorrect(playerData);
```

### Test Step Naming

**Format**: `[Given|When|And|Then] [subject] [action/result]`

```typescript
// Given (precondition)
'Given the NBA website is successfully loaded'
'Given user is logged in and on Players page'
'Given the player table is visible'

// When (action)
'When I click on the Sign In Link'
'When user searches for a player'
'When I filter by country'

// And (additional action or condition)
'And a user fills in the Sign In details'
'And clicks the search button'

// Then (expected result)
'Then the user should see My Account page'
'Then player details match expected data'
'Then the table should display 10 rows'
```

### Assertions in Tests

**Rule**: Assertions inside page object methods, not in test file

```typescript
// Page object method (signInPage.ts)
public async AssertSignInPage(): Promise<void> {
    await expect(this._signInTitle()).toContainText('Sign In');
}

// Test file
await test.step('Then assertion passes', async() => {
    await mainPage.signInpage.AssertSignInPage(); // Assertion is inside
});
```

---

## Navigation & Page Composition

### Pattern: Getter-Based Page Navigation

Page objects return new instances of related pages via getters:

```typescript
// In mainPage.ts
public get signInpage(): SignInpage {
    return new SignInpage(this.page);
}

public get playerHome(): PlayerHomepage {
    return new PlayerHomepage(this.page);
}

public get myAccountPage(): MyAccountPage {
    return new MyAccountPage(this.page);
}

// In playerHome.ts
public get personPlayerHome(): PersonPlayerPage {
    return new PersonPlayerPage(this.page);
}
```

### Usage in Tests

```typescript
// Chain page objects seamlessly
await mainPage.signInpage.FillInEmailField(data);
await mainPage.playerHome.SearchAPlayer(data);
await mainPage.playerHome.personPlayerHome.AssertPlayerDetailsAreCorrect(data);
```

**Advantages**:
- No explicit page object instantiation in tests
- Clean, fluent API
- All pages share same `Page` instance
- Maintains navigation context

### Inheritance Pattern: Selective Extension

**Generally prefer composition** over inheritance, but extend when **reusing methods**:

```typescript
// MyAccountPage extends SignInpage (reuses form-filling methods)
export class MyAccountPage extends SignInpage {
    constructor(page: Page) {
        super(page);
    }

    // Reuses: FillInEmailField(), FillInPasswordField()
    // Adds: ConfrimUserDataFromMyAccountPage()

    public async ConfrimUserDataFromMyAccountPage(data: DataPage): Promise<void> {
        await expect(this._myAccountPageInfo()).toContainText(data.email);
    }
}
```

**When to extend**:
- Page B reuses multiple methods from Page A
- Logical parent-child relationship (MyAccountPage IS-A SignInpage)

**Otherwise use composition**:
```typescript
public get signInpage(): SignInpage {
    return new SignInpage(this.page);
}
```

---

## Integration Flow

### Complete Test Execution Flow

```
Test Starts
│
├─ New Mainpage(page)
│  └─ Constructor: this.page = page
│
├─ New DataPage().dataEntries
│  └─ Getter populates email, password, playerName
│
├─ mainPage.LoadApplicationUnderTest(url)
│  └─ Page navigates to URL
│
├─ mainPage.HoverAndClickSignInLink()
│  └─ Locator: this._signInGoto()
│  └─ Action: await .hover() + .click()
│
├─ mainPage.signInpage.FillInEmailField(data)
│  └─ New SignInpage(this.page) instantiated
│  └─ Locator: this._emailField()
│  └─ Action: await .fill(data.email)
│
├─ mainPage.playerHome.SearchAPlayer(data)
│  └─ New PlayerHomepage(this.page) instantiated
│  └─ Locators: this._searchField(), this._resultItem()
│  └─ Actions: .fill(), .click()
│
├─ mainPage.playerHome.personPlayerHome.AssertPlayerDetails(data)
│  └─ New PersonPlayerPage(this.page) instantiated
│  └─ Assertion: expect().toContainText()
│
└─ Test Ends
```

### Data Flow Pattern

```
Test instantiates DTO
    │
    └─ DataPage().dataEntries → DataPage object with populated properties
    │  └─ { email, password, playerName }
    │
    └─ Passes to page object methods
       │
       ├─ mainPage.signInpage.FillInEmailField(data)
       │  └─ Accesses data.email
       │
       ├─ mainPage.playerHome.SearchAPlayer(data)
       │  └─ Accesses data.playerName
       │
       └─ mainPage.myAccountPage.ConfrimUserData(data)
          └─ Verifies data.email in UI
```

### Page Communication Rules

**Rule 1**: All pages share the same `Page` instance
```typescript
// mainPage.ts
public get signInpage(): SignInpage {
    return new SignInpage(this.page);  // Same this.page
}

// This means signInpage can perform actions on elements loaded by mainPage
```

**Rule 2**: Data flows through DTOs, not page-to-page

```typescript
// ✓ Correct: test controls data flow
const data = new DataPage().dataEntries;
await mainPage.method1(data);
await mainPage.method2(data);

// ✗ Wrong: page shouldn't pass data to another page
// (pages don't communicate directly except through shared Page instance)
```

**Rule 3**: Navigation happens through getters, not explicit instantiation

```typescript
// ✓ Correct
await mainPage.signInpage.FillInEmailField(data);

// ✗ Wrong
const signInPage = new SignInpage(page);
await signInPage.FillInEmailField(data);
// (loses context that this came from mainPage)
```

---

## Code Templates

### Template 1: New Page Object Class

```typescript
import { Page, Locator, expect } from '@playwright/test';

export class NewPagePage {
    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // ==================== LOCATORS ====================
    private _elementName = (): Locator => this.page.getByTestId('element-id');
    private _anotherElement = (): Locator => 
        this.page.getByRole('button', { name: 'Click Me' });

    // ==================== ACTIONS ====================
    public async InteractWithElement(): Promise<void> {
        await this._elementName().click();
    }

    public async FillForm(data: any): Promise<void> {
        await this._elementName().fill(data.value);
        await this._anotherElement().click();
    }

    // ==================== ASSERTIONS ====================
    public async AssertElementVisible(): Promise<void> {
        await expect(this._elementName()).toBeVisible();
    }

    public async AssertElementContains(text: string): Promise<void> {
        await expect(this._elementName()).toContainText(text);
    }

    // ==================== NAVIGATION ====================
    public get nextPage(): NextPagePage {
        return new NextPagePage(this.page);
    }
}
```

**Customization**:
1. Replace `NewPagePage` with actual page name (PascalCase, full word)
2. Replace `_elementName` with actual element descriptors
3. Replace selectors with appropriate locator strategy
4. Add action methods for all user interactions
5. Add assertion methods for all verifications
6. Add navigation getters for linked pages

### Template 2: New Test Case

```typescript
import { test } from '@playwright/test';
import { Mainpage } from '../src/pages/mainPage';
import { DataPage } from '../src/pages/dataPage';
import { SomeDto } from '../src/pages/some.dto';

test.describe('Feature Name', () => {
    test('Specific test scenario description', async({ page }) => {
        // Instantiate page objects
        const mainPage = new Mainpage(page);
        const data = new DataPage().dataEntries;
        const dtoData = new SomeDto().someGetter;

        // Step 1: Given
        await test.step('Given precondition is met', async() => {
            await mainPage.LoadApplicationUnderTest('https://www.nba.com');
        });

        // Step 2: When
        await test.step('When user performs action', async() => {
            await mainPage.SomeAction();
        });

        // Step 3: And (optional intermediate steps)
        await test.step('And additional action occurs', async() => {
            await mainPage.AnotherAction(data);
        });

        // Step 4: Then
        await test.step('Then assertion verifies result', async() => {
            await mainPage.somePageObject.AssertCondition(dtoData);
        });
    });
});
```

**Customization**:
1. Replace `Feature Name` with actual feature
2. Replace test description with specific scenario
3. Add/remove DTOs as needed
4. Fill in actual page object methods
5. Follow BDD structure: Given → When → And → Then

### Template 3: New DTO Class

```typescript
export class NewDto {
    public property1: string;
    public property2: string[];
    public property3: Map<string, any>;

    public get dataGetter(): NewDto {
        this.property1 = 'value1';
        this.property2 = ['item1', 'item2', 'item3'];
        this.property3 = new Map();
        this.property3.set('key', ['val1', 'val2']);
        return this;
    }
}

// Usage in test:
// const data = new NewDto().dataGetter;
// console.log(data.property1); // 'value1'
```

**Customization**:
1. Define public properties with appropriate types
2. Create getter method that initializes all properties
3. Return `this` from getter for fluent API
4. Name getter descriptively (detailOnList, dataEntries, etc.)

### Template 4: Integration Pattern - Wiring New Page

```typescript
// 1. Create new page object: src/pages/newPage.ts
export class NewPagePage {
    // ... (see Template 1)
}

// 2. Add to mainPage.ts (or parent page object)
export class Mainpage {
    // ... existing code ...

    public get newPageObject(): NewPagePage {
        return new NewPagePage(this.page);
    }
}

// 3. Use in test: tests/newFeature.spec.ts
const mainPage = new Mainpage(page);
await mainPage.newPageObject.SomeAction();
```

---

## Best Practices

### 1. Lazy Locator Evaluation

**Good**: Locators defined as methods called each time
```typescript
private _emailField = (): Locator => this.page.getByTestId('email');

// In method
await this._emailField().fill(email);  // Fresh Locator object each call
await this._emailField().click();
```

**Avoid**: Storing Locator in property (becomes stale)
```typescript
private emailField = this.page.getByTestId('email');  // ✗ Stale!

// Later in test, element detaches
await this.emailField.fill(email);  // Flaky!
```

### 2. Accessible Locators First

**Preference order**:
1. `getByRole()` — Most accessible, resilient
2. `getByTestId()` — Explicit, stable
3. `getByText()`, `getByLabel()`, `getByPlaceholder()` — User-visible text
4. XPath with text() — For complex matches
5. CSS class selectors — Last resort

```typescript
// ✓ Best
private _signInButton = (): Locator => 
    this.page.getByRole('button', { name: 'Sign In' });

// ✓ Good
private _emailField = (): Locator => 
    this.page.getByTestId('email');

// ⚠ Acceptable (use carefully)
private _gameLink = (): Locator => 
    this.page.locator('//span[text()="Games"]');

// ✗ Avoid
private _header = (): Locator => 
    this.page.locator('.HeaderComponent_root__abc123');
```

### 3. Method Clarity: Action vs Assertion

**Keep separate**:
- Action methods: User interactions (`Click`, `Fill`, `Hover`)
- Assertion methods: Verification (`Assert`, `Confirm`, `Verify`)

```typescript
// ✓ Clear distinction
public async ClickButton(): Promise<void> {
    await this._button().click();
}

public async AssertButtonIsDisabled(): Promise<void> {
    await expect(this._button()).toBeDisabled();
}

// ✗ Mixed concerns (confusing)
public async ClickButtonAndAssert(): Promise<void> {
    await this._button().click();
    await expect(this._button()).not.toBeVisible();
}
```

### 4. Type Safety

**Always use explicit types**:
```typescript
// ✓ Typed
public async SearchPlayer(playerName: string): Promise<void> {
    await this._searchField().fill(playerName);
}

public async AssertPlayerCount(count: number): Promise<void> {
    const rows = await this._playerRows().count();
    expect(rows).toBe(count);
}

// ✗ Avoid any
public async SearchPlayer(playerName: any): Promise<void> {
    await this._searchField().fill(playerName);
}
```

### 5. Single Responsibility: One Action Per Method

**Good**: Methods do one thing
```typescript
public async FillLoginForm(data: DataPage): Promise<void> {
    await this.FillInEmailField(data);
    await this.FillInPasswordField(data);
}

public async FillInEmailField(data: DataPage): Promise<void> {
    await this._emailField().fill(data.email);
}

public async FillInPasswordField(data: DataPage): Promise<void> {
    await this._passwordField().fill(data.password);
}
```

**Avoid**: Methods doing multiple unrelated things
```typescript
// ✗ Too many responsibilities
public async CompleteSignIn(data: DataPage): Promise<void> {
    await this._emailField().fill(data.email);
    await this._passwordField().fill(data.password);
    await this._rememberCheckbox().check();
    await this._signInButton().click();
    await this.page.waitForNavigation();
    const user = await this._userGreeting().textContent();
    expect(user).toContain(data.email);
}
```

### 6. Reusable Methods via Composition

```typescript
// ✓ Reusable pieces (short, single-purpose)
public async FillInEmailField(data: DataPage): Promise<void> {
    await this._emailField().fill(data.email);
}

public async FillInPasswordField(data: DataPage): Promise<void> {
    await this._passwordField().fill(data.password);
}

public async ClickSignInBtn(): Promise<void> {
    await this._signInButton().click();
}

// Used in multiple tests
// test 1: mainPage.signInpage.FillInEmailField(data)
// test 2: mainPage.signInpage.ClickSignInBtn()
```

### 7. No Hard-Coded Test Data in Page Objects

**Good**: Data passed as parameters
```typescript
public async SearchPlayer(playerName: string): Promise<void> {
    await this._searchField().fill(playerName);
}

// In test
const data = new DataPage().dataEntries;
await mainPage.playerHome.SearchPlayer(data.playerName);
```

**Avoid**: Hard-coded test data
```typescript
// ✗ Wrong
public async SearchMalakiBranham(): Promise<void> {
    await this._searchField().fill('Malaki Branham');  // Hard-coded!
}
```

### 8. Descriptive Getter Names

```typescript
// ✓ Clear intent
public get signInpage(): SignInpage { ... }
public get playerHome(): PlayerHomepage { ... }
public get expectedPlayerValuesForAllPlayers(): PlayerTableDto { ... }

// ✗ Vague
public get page(): SomePage { ... }
public get data(): DataPage { ... }
```

### 9. Consistent Error Handling

**Use Playwright's built-in wait and retry mechanisms**:
```typescript
// ✓ Playwright handles waits automatically
public async ClickOnPlayer(): Promise<void> {
    await this._playerLink().click();  // Auto-waits for element
}

// ✗ Don't add manual waits (usually)
public async ClickOnPlayer(): Promise<void> {
    await this.page.waitForSelector('[data-testid="player"]', { timeout: 5000 });
    await this._playerLink().click();
}
```

### 10. Fluent Navigation Chains

```typescript
// ✓ Clean, fluent
await mainPage.playerHome.personPlayerHome.AssertPlayerDetailsAreCorrect(data);

// ✗ Verbose intermediate variables
const playerHome = mainPage.playerHome;
const personPage = playerHome.personPlayerHome;
await personPage.AssertPlayerDetailsAreCorrect(data);
```

---

## Known Issues & Fixes

### Issue 1: Inconsistent Class Naming

**Problem**:
- `Mainpage` should be `MainPage` (capitalize "Page")
- `SignInpage` should be `SignInPage`
- `PlayerHomepage` should be `PlayerHomePage`

**Current State**:
- mainPage.ts: class `Mainpage` ✗
- signInPage.ts: class `SignInpage` ✗
- playerHome.ts: class `PlayerHomepage` ✗
- personPlayerHome.ts: class `PersonPlayerPage` ✓
- myAccountPage.ts: class `MyAccountPage` ✓

**Recommendation**: Correct class names in all future code
```typescript
// ✓ New code should use
export class MainPage { ... }
export class SignInPage { ... }
export class PlayerHomePage { ... }
```

**Migration**: Existing code can continue using current names, but apply corrected naming immediately to new code.

### Issue 2: Method Name Typos

**Problem**:
- `ConfrimUserDataFromMyAccountPage()` should be `ConfirmUserDataFromMyAccountPage()`
- `AssertPlayerInfromation1()` should be `AssertPlayerInformation1()`

**Current State**:
- myAccountPage.ts: `ConfrimUserDataFromMyAccountPage()` ✗
- personPlayerHome.ts: `AssertPlayerInfromation1()` ✗

**Recommendation**: Correct in new methods
```typescript
// ✓ New methods
public async ConfirmUserDataFromMyAccountPage(data: DataPage): Promise<void> { ... }
public async AssertPlayerInformation1(): Promise<void> { ... }
```

### Issue 3: Incomplete Component

**Problem**: [playerTableComponent.ts](src/pages/playerTableComponent.ts) has empty/commented-out assertions

**Current State**:
```typescript
public async assertPlayerTableComponent(): Promise<void> {
    // All assertions commented out
    // await expect(this.masterList).toBeVisible();
    // ... more commented code
}
```

**Recommendation**: Complete or document why incomplete
```typescript
// Option A: Complete the assertions
public async AssertPlayerTableComponent(): Promise<void> {
    await expect(this._playerTable()).toBeVisible();
    await expect(this._playerRows()).toHaveCount(this.expectedRowCount);
}

// Option B: Document as placeholder
public async AssertPlayerTableComponent(): Promise<void> {
    // TODO: Implement table-specific assertions
    // - Verify table visibility
    // - Verify row count matches players
    // - Verify column headers
    throw new Error('Not yet implemented');
}
```

### Issue 4: Dual Configuration Files

**Problem**: Both `playwright.config.ts` and `playwright2.config.ts` exist

**Current State**:
- playwright.config.ts: 7 browser projects, 2 retries
- playwright2.config.ts: 3 browser projects, HTML reporter only

**Recommendation**: Choose one primary config or document use cases
```typescript
// playwright.config.ts — PRIMARY (use for CI/CD)
// playwright2.config.ts — ALTERNATIVE (use for quick local testing?)

// Consider:
// - Keep only one unless there's explicit reason for both
// - Document in README which config to use when
// - Or consolidate into single config with profile selection
```

### Issue 5: Empty Test File

**Problem**: [otherFunctionalities.spec.ts](tests/otherFunctionalities.spec.ts) only has imports, no tests

**Current State**:
```typescript
import { test, expect, Page } from '@playwright/test';
import { Mainpage } from '../src/pages/mainPage';
// ... other imports, but no test.describe() or test()
```

**Recommendation**: Either implement tests or remove file
```typescript
// Option A: Implement tests using template
test.describe('Other Functionalities', () => {
    test('Feature X', async({ page }) => {
        // BDD steps
    });
});

// Option B: Remove file and add when needed
// (Avoid leaving placeholder files)
```

### Issue 6: Hard-Coded Selectors vs Generic Ones

**Problem**: Some selectors are tied to specific test data or component implementations

**Current State**:
```typescript
private _masterPlayerDetails = (): Locator => 
    this.page.locator('.PlayerSummary_masterInnerBio__JQkoj');  // CSS module-scoped
```

**Risk**: Breaks if CSS class names change

**Recommendation**: Use more resilient selectors
```typescript
// ✓ Prefer role-based or TestId
private _masterPlayerDetails = (): Locator => 
    this.page.getByTestId('player-summary-bio');

// Or explicit selector if stable
private _masterPlayerDetails = (): Locator => 
    this.page.locator('[data-section="player-bio"]');
```

### Issue 7: No Wait Strategies Explicitly Defined

**Problem**: No explicit wait or retry configuration beyond Playwright defaults

**Current State**: Tests rely entirely on Playwright's auto-wait mechanism

**Recommendation**: Add documentation about wait strategy
```typescript
// Document in page object
/**
 * Playwright automatically waits for elements to be:
 * - Attached to DOM
 * - Visible (for interactive actions)
 * - Stable (position doesn't move)
 * - Enabled (if applicable)
 * 
 * For flaky tests, consider:
 * - Using waitFor() with explicit conditions
 * - Increasing default timeout in config
 * - Using stronger locators
 */
public async InteractWithElement(): Promise<void> {
    // Implicitly waits per above conditions
    await this._element().click();
}
```

---

## Configuration Reference

### playwright.config.ts (Primary Configuration)

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Test discovery
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  
  // Execution
  fullyParallel: true,  // All tests run concurrently
  forbidOnly: process.env.CI ? true : false,  // Fail if .only() left in code
  retries: process.env.CI ? 2 : 0,  // 2 retries on CI, 0 locally
  workers: process.env.CI ? 1 : undefined,  // 1 worker on CI, auto locally
  
  // Reporting
  reporter: [
    ['html', { outputFolder: 'test-results/html' }],
    ['junit', { outputFile: 'test-results/results.xml' }]
  ],
  
  // Timeout
  timeout: 30 * 1000,  // 30 second timeout per test
  
  // Common settings for all browsers
  use: {
    baseURL: 'https://www.nba.com',
    trace: 'on-first-retry',  // Record trace on retry
  },
  
  // Artifacts (screenshots, videos, traces)
  webServer: undefined,  // Set if you need local server
  
  // Browsers to test on
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chromium'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
    { name: 'MS Edge', use: { ...devices['Desktop Edge'] } },
    { name: 'Google Chrome', use: { ...devices['Desktop Chrome'] } },
  ],
});
```

**Key Settings**:
- `fullyParallel: true` — All tests run concurrently (use for speed)
- `retries: 2` — Retry flaky tests on CI
- `workers: 1` — Single worker on CI to avoid resource contention
- `trace: 'on-first-retry'` — Capture trace for debugging failures
- `reporter: ['html', 'junit']` — Generate both HTML and JUnit reports

### playwright2.config.ts (Alternative Configuration)

```typescript
// Similar to playwright.config.ts but:
// - 3 browsers instead of 7
// - HTML reporter only (no JUnit)
// - Explicit 60s timeout
```

**Use case**: Local quick testing without JUnit output

### tsconfig.json (TypeScript Configuration)

```json
{
  "compilerOptions": {
    "target": "ES2021",
    "module": "commonjs",
    "strict": false,  // Note: Not fully strict
    "alwaysStrict": true,  // But individual files are strict
    "noImplicitAny": true,  // Catch missing type annotations
    "noImplicitReturns": true,  // Require explicit return types
    "noUnusedParameters": true,  // Warn on unused params
    "sourceMap": true,  // Enable source maps for debugging
    "moduleResolution": "node",
    "lib": ["es2021"]
  },
  "include": ["src/**/*", "tests/**/*"],
  "exclude": ["node_modules"]
}
```

**Key Settings**:
- `noImplicitAny: true` — Catch type issues
- `noImplicitReturns: true` — Require explicit return types
- `noUnusedParameters: true` — Clean up unused vars

### package.json (Dependencies and Scripts)

```json
{
  "devDependencies": {
    "@playwright/test": "^1.49.1",
    "@types/node": "^22.10.1",
    "typescript": "^5.7.2"
  },
  "dependencies": {
    "playwright": "^1.49.1"
  },
  "scripts": {
    "test": "npx playwright test",
    "test:headed": "npx playwright test --headed",
    "test:debug": "npx playwright test --debug",
    "test:ui": "npx playwright test --ui",
    "test:report": "npx playwright show-report"
  }
}
```

**Available Commands**:
- `npm test` — Run all tests headless
- `npm run test:headed` — Run with browser visible
- `npm run test:debug` — Debug mode (step through code)
- `npm run test:ui` — Interactive UI mode
- `npm run test:report` — Show HTML report

---

## How-To Examples

### How-To: Add a New Page Object

**Step 1**: Create file `src/pages/newFeaturePage.ts`
```typescript
import { Page, Locator, expect } from '@playwright/test';

export class NewFeaturePage {
    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // Add locators
    private _featureButton = (): Locator => 
        this.page.getByRole('button', { name: 'New Feature' });
    
    // Add actions
    public async ClickFeatureButton(): Promise<void> {
        await this._featureButton().click();
    }

    // Add assertions
    public async AssertFeatureLoaded(): Promise<void> {
        await expect(this._featureButton()).toBeVisible();
    }
}
```

**Step 2**: Register in parent page object (mainPage.ts)
```typescript
export class Mainpage {
    // ... existing code ...

    public get newFeaturePage(): NewFeaturePage {
        return new NewFeaturePage(this.page);
    }
}
```

**Step 3**: Use in test
```typescript
const mainPage = new Mainpage(page);
await mainPage.newFeaturePage.ClickFeatureButton();
await mainPage.newFeaturePage.AssertFeatureLoaded();
```

### How-To: Add a New Test Case

**Step 1**: Create test in `tests/featureName.spec.ts`
```typescript
import { test } from '@playwright/test';
import { Mainpage } from '../src/pages/mainPage';
import { DataPage } from '../src/pages/dataPage';

test.describe('New Feature', () => {
    test('User can interact with new feature', async({ page }) => {
        const mainPage = new Mainpage(page);
        const data = new DataPage().dataEntries;

        await test.step('Given application is loaded', async() => {
            await mainPage.LoadApplicationUnderTest('https://www.nba.com');
        });

        await test.step('When user clicks new feature button', async() => {
            await mainPage.newFeaturePage.ClickFeatureButton();
        });

        await test.step('Then feature should be visible', async() => {
            await mainPage.newFeaturePage.AssertFeatureLoaded();
        });
    });
});
```

**Step 2**: Run test
```bash
npm test -- tests/featureName.spec.ts
```

### How-To: Create a New DTO

**Step 1**: Create file `src/pages/featureData.dto.ts`
```typescript
export class FeatureDataDto {
    public userId: string;
    public userName: string;
    public settings: Map<string, string>;

    public get defaultUserData(): FeatureDataDto {
        this.userId = 'user123';
        this.userName = 'Test User';
        this.settings = new Map();
        this.settings.set('theme', 'dark');
        this.settings.set('language', 'en');
        return this;
    }

    public get premiumUserData(): FeatureDataDto {
        this.userId = 'premium456';
        this.userName = 'Premium User';
        this.settings = new Map();
        this.settings.set('theme', 'light');
        this.settings.set('language', 'es');
        this.settings.set('notifications', 'enabled');
        return this;
    }
}
```

**Step 2**: Use in test
```typescript
const defaultData = new FeatureDataDto().defaultUserData;
const premiumData = new FeatureDataDto().premiumUserData;

await mainPage.feature.SetUserData(defaultData);
await mainPage.feature.SetUserData(premiumData);
```

### How-To: Handle Dynamic Content with Chained Locators

**Scenario**: Find a player's height within a table row

```typescript
// In personPlayerHome.ts
private _playerHeightValue = (): Locator => {
    return this.page
        .locator('.PlayerSummary_playerInfo__om2G4')  // Container
        .filter({ hasText: 'HEIGHT' })  // Filter to HEIGHT row
        .locator('.PlayerSummary_playerInfoValue__JS8_v');  // Value within row
};

// Use in method
public async GetPlayerHeight(): Promise<string> {
    return await this._playerHeightValue().textContent() ?? '';
}

// Or assert
public async AssertPlayerHeight(expectedHeight: string): Promise<void> {
    await expect(this._playerHeightValue()).toContainText(expectedHeight);
}
```

### How-To: Complete an Incomplete Feature (playerTableComponent Example)

**Current State**: Assertions are commented out

**Step 1**: Analyze what should be tested
```typescript
// In playerTableComponent.ts
export class PlayerTableComponent {
    // Methods exist but assertions commented out
    public async assertPlayerTableComponent(): Promise<void> {
        // TODO: uncomment and complete
    }
}
```

**Step 2**: Implement properly
```typescript
export class PlayerTableComponent {
    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // Locators for table elements
    private _tableContainer = (): Locator => 
        this.page.getByTestId('player-table');
    
    private _tableRows = (): Locator => 
        this._tableContainer().locator('tbody tr');
    
    private _columnHeaders = (): Locator => 
        this._tableContainer().locator('thead th');

    // Actions
    public async SortByColumn(columnName: string): Promise<void> {
        const header = this._columnHeaders()
            .filter({ hasText: columnName })
            .locator('button');
        await header.click();
    }

    // Assertions
    public async AssertPlayerTableComponent(expectedData: PlayerTableDto): Promise<void> {
        await expect(this._tableContainer()).toBeVisible();
        
        const rowCount = await this._tableRows().count();
        expect(rowCount).toBeGreaterThan(0);

        // Verify headers
        const headers = expectedData.expectedPlayerTableValues.get('headers') ?? [];
        for (const header of headers) {
            await expect(this._columnHeaders()).toContainText(header);
        }
    }

    public async AssertPlayerInRow(playerName: string): Promise<void> {
        const playerRow = this._tableRows()
            .filter({ hasText: playerName });
        await expect(playerRow).toBeVisible();
    }
}
```

**Step 3**: Use in test
```typescript
test('Player table displays correctly', async({ page }) => {
    const mainPage = new Mainpage(page);
    const tableData = new PlayerTableDto().expectedPlayerValuesForAllPlayers;

    await test.step('Given player table is loaded', async() => {
        await mainPage.playerHome.OpenPlayerTable();
    });

    await test.step('Then table should have correct structure', async() => {
        await mainPage.playerHome.playerTableComponent
            .AssertPlayerTableComponent(tableData);
    });
});
```

### How-To: Troubleshoot Flaky Tests

**Problem**: Test fails intermittently due to timing issues

**Solution 1**: Check locator robustness
```typescript
// ✗ Fragile: position-based
private _firstPlayer = (): Locator => 
    this.page.locator('tbody tr').nth(0);

// ✓ Robust: text-based
private _playerByName = (name: string): Locator => 
    this.page.locator(`tbody tr:has-text("${name}")`);
```

**Solution 2**: Add explicit waits for dynamic content
```typescript
public async SearchAndWaitForPlayer(playerName: string): Promise<void> {
    await this._searchField().fill(playerName);
    
    // Wait for search results to appear
    await this._playerResult(playerName).waitFor({ state: 'visible' });
    await this._playerResult(playerName).click();
}
```

**Solution 3**: Increase timeout for slow operations
```typescript
// In playwright.config.ts
timeout: 60 * 1000,  // 60 seconds instead of 30

// Or per test
test('Slow test', async({ page }) => {
    test.setTimeout(90000);  // 90 seconds for this test
    // ... test code
});
```

**Solution 4**: Check for race conditions in setup
```typescript
// ✗ Possible race condition
test('', async({ page }) => {
    const mainPage = new Mainpage(page);
    await mainPage.LoadApplicationUnderTest(url);
    await mainPage.HoverAndClickSignInLink();  // Element might not be ready yet
});

// ✓ Add explicit wait
test('', async({ page }) => {
    const mainPage = new Mainpage(page);
    await mainPage.LoadApplicationUnderTest(url);
    await expect(mainPage.signInLink).toBeVisible();  // Wait first
    await mainPage.HoverAndClickSignInLink();
});
```

### How-To: Debug a Failing Test

**Step 1**: Run test in debug mode
```bash
npm run test:debug -- tests/myTest.spec.ts
```

**Step 2**: Or use UI mode for visibility
```bash
npm run test:ui
```

**Step 3**: Check HTML report for screenshots/traces
```bash
npm run test:report
```

**Step 4**: Add console logging (sparingly)
```typescript
public async MyAction(): Promise<void> {
    console.log('About to click element');
    await this._element().click();
    console.log('Element clicked');
}
```

**Step 5**: Check Playwright trace
```typescript
// In playwright.config.ts, trace is already set to 'on-first-retry'
// View traces in test-results/html/trace.zip
```

---

## Summary of Key Takeaways

### Architecture
- **Page Object Model** with **dependency injection** pattern
- All pages receive `Page` instance via constructor
- Lazy locator evaluation prevents stale elements
- Fluent navigation via getters for chaining pages

### Naming Conventions (Apply to New Code)
- **Classes**: Full PascalCase (`MainPage`, not `Mainpage`)
- **Methods**: Action-first PascalCase (`ClickButton`, `AssertVisible`)
- **Locators**: camelCase with underscore prefix (`_emailField`)
- **Properties**: camelCase (`playerName`, `heightData`)
- **Tests**: BDD style with Given/When/And/Then

### Code Organization
- **Page objects**: Actions, assertions, navigation getters
- **DTOs**: Data holders with getter-based initialization
- **Tests**: Fixture-based with BDD steps
- **Locators**: Private methods returning `Locator` for lazy evaluation

### Best Practices
1. Prefer role-based locators (`getByRole`) over CSS classes
2. Define locators as private methods to avoid stale references
3. Separate action methods from assertion methods
4. Pass data through DTOs, not between page objects
5. Use `test.step()` for clear test structure
6. Keep methods focused on single responsibility
7. Use explicit types (no `any`)

### Known Issues to Watch
- Class names inconsistent in existing code (fix in new code)
- Method name typos exist (`Confrim`, `Infromation`)
- PlayerTableComponent incomplete (add assertions as needed)
- Dual config files (consolidate or document)

---

**This framework provides a solid foundation for maintainable, readable test automation. Follow these patterns and guidelines to ensure consistency and reduce bugs.**
