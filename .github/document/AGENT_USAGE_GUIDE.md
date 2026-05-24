# Playwright MCP Test Generation Agent - Complete Guide

## Overview

The **Playwright MCP Test Generation Agent** is an automated system that creates comprehensive test suites by:

1. 🔗 Accepting a website URL
2. 🤖 Orchestrating Playwright MCP interactions
3. 📝 Generating test files and page objects
4. 📚 Creating full documentation
5. 🎯 Following Page Object Model patterns

## Quick Start

### 1. Generate Test Suite Template

```bash
npm run generate-tests -- https://example.com "Feature Name" "feature-name"
```

**Example:**
```bash
npm run generate-tests -- https://www.nba.com "Game Navigation" "game-navigation"
```

**What it generates:**
- ✅ Test file: `tests/game-navigation.spec.ts`
- ✅ Page object: `src/pages/game-navigation.ts`
- ✅ Documentation: `tests/GAME_NAVIGATION_TESTS_DOCS.md`
- ✅ Config file: `.game-navigation-config.json`

### 2. Open Playwright MCP in Copilot Chat

In VS Code Copilot Chat (`Ctrl+Shift+I`), send:

```
I need to implement Playwright tests for: [Feature Name]
Website: [Website URL]

Please use Playwright MCP to:
1. Navigate to the website
2. Show me the page structure
3. Help identify locators for key elements
4. Record the user interactions
5. Generate the locator selectors

Here's the page object file I need to populate: src/pages/[feature-name].ts
```

### 3. Complete the Implementation

1. **Get Locators from MCP**
   - MCP shows you the page accessibility tree
   - You copy the suggested selectors

2. **Add to Page Object**
   ```typescript
   // From MCP suggestion
   private _button = (): Locator => this.page.getByRole('button', { name: 'Click' });
   ```

3. **Create Methods**
   ```typescript
   public async clickButton(): Promise<void> {
     await this._button().click();
   }
   ```

4. **Fill Test Steps**
   ```typescript
   await test.step('When user clicks button', async () => {
     await pageObject.clickButton();
   });
   ```

### 4. Run Tests

```bash
npm test -- tests/game-navigation.spec.ts
```

## Complete Workflow Example

### Scenario: Creating Tests for Netflix

#### Step 1: Generate Template

```bash
npm run generate-tests -- https://www.netflix.com "Login Flow" "netflix-login" "Test Netflix login functionality"
```

#### Step 2: View Generated Files

```
tests/netflix-login.spec.ts         ← Test file (template)
src/pages/netflix-login.ts          ← Page object (template)
tests/NETFLIX_LOGIN_TESTS_DOCS.md   ← Documentation
.netflix-login-config.json          ← Configuration
```

#### Step 3: Start MCP Session

Open Copilot Chat and send:

```
Website: https://www.netflix.com
Feature: Login Flow

Using Playwright MCP, please:
1. Navigate to Netflix
2. Show me the login form elements
3. Identify the email input locator
4. Identify the password input locator
5. Identify the sign in button locator
6. Record clicking each element

Here's what I need to populate:
- Email field locator: private _emailInput = (): Locator => ...
- Password field locator: private _passwordInput = (): Locator => ...
- Sign in button locator: private _signInButton = (): Locator => ...

Methods needed:
- fillEmail(email: string)
- fillPassword(password: string)
- clickSignIn()
- verifyLoginPage()
```

#### Step 4: MCP Shows Page Structure

```
📍 Netflix Login Page
├── Email Input Field
│   └── getByRole('textbox', { name: 'Email' })
├── Password Input Field
│   └── getByRole('textbox', { name: 'Password' })
├── Sign In Button
│   └── getByRole('button', { name: 'Sign In' })
└── Error Message (optional)
    └── getByText('Invalid credentials')
```

#### Step 5: Update Page Object

```typescript
// src/pages/netflix-login.ts

export class NetflixLoginPage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // ==================== LOCATORS ====================
  private _emailInput = (): Locator => 
    this.page.getByRole('textbox', { name: 'Email' });
  
  private _passwordInput = (): Locator => 
    this.page.getByRole('textbox', { name: 'Password' });
  
  private _signInButton = (): Locator => 
    this.page.getByRole('button', { name: 'Sign In' });

  // ==================== ACTIONS ====================
  public async fillEmail(email: string): Promise<void> {
    await this._emailInput().fill(email);
  }

  public async fillPassword(password: string): Promise<void> {
    await this._passwordInput().fill(password);
  }

  public async clickSignIn(): Promise<void> {
    await this._signInButton().click();
  }

  // ==================== ASSERTIONS ====================
  public async verifyLoginPage(): Promise<void> {
    await expect(this._emailInput()).toBeVisible();
    await expect(this._passwordInput()).toBeVisible();
    await expect(this._signInButton()).toBeVisible();
  }
}
```

#### Step 6: Update Test File

```typescript
// tests/netflix-login.spec.ts

test('User can log in with valid credentials', async () => {
  const loginPage = new NetflixLoginPage(page);

  await test.step('Given user is on Netflix login page', async () => {
    await page.goto('https://www.netflix.com');
    await loginPage.verifyLoginPage();
  });

  await test.step('When user enters email and password', async () => {
    await loginPage.fillEmail('test@example.com');
    await loginPage.fillPassword('password123');
  });

  await test.step('And clicks Sign In button', async () => {
    await loginPage.clickSignIn();
  });

  await test.step('Then user should see dashboard', async () => {
    await expect(page).toHaveTitle(/Netflix/);
  });
});
```

#### Step 7: Run Tests

```bash
npm test -- tests/netflix-login.spec.ts --headed
```

---

## File Structure

### Generated Files Template

```
project/
├── src/
│   └── pages/
│       └── [feature-name].ts          ← Page object
├── tests/
│   ├── [feature-name].spec.ts         ← Test file
│   └── [FEATURE-NAME]_TESTS_DOCS.md   ← Documentation
└── scripts/
    ├── generate-tests-agent.ts        ← Agent
    └── workflow-manager.ts            ← Workflow manager
```

### Page Object Template Structure

```typescript
export class FeaturePage {
  // Constructor
  constructor(page: Page)

  // ==================== LOCATORS ====================
  private _element = (): Locator => ...

  // ==================== ACTIONS ====================
  public async doSomething(): Promise<void> { }

  // ==================== ASSERTIONS ====================
  public async assertCondition(): Promise<void> { }
}
```

### Test File Template Structure

```typescript
test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup
  });

  test('Description', async () => {
    await test.step('Given ...', async () => { });
    await test.step('When ...', async () => { });
    await test.step('Then ...', async () => { });
  });
});
```

---

## Usage Patterns

### Pattern 1: Quick Generation

```bash
# Generate and immediately implement
npm run generate-tests -- https://example.com "Feature"
```

### Pattern 2: Batch Generation

```bash
# Generate multiple test suites
npm run generate-tests -- https://example.com "Feature 1" "feature-1"
npm run generate-tests -- https://example.com "Feature 2" "feature-2"
npm run generate-tests -- https://example.com "Feature 3" "feature-3"
```

### Pattern 3: With Full Description

```bash
npm run generate-tests -- https://example.com "Login Flow" "login" "Complete login and authentication flow with error handling"
```

---

## MCP Integration Flow

### Step 1: Agent Initializes
```
npm run generate-tests -- <url> <feature>
         ↓
    Creates templates
    ↓
    Displays instructions
```

### Step 2: Open MCP in Chat
```
Copilot Chat
    ↓
    Enable MCP mode
    ↓
    Share website URL
```

### Step 3: MCP Records Interactions
```
MCP navigates website
    ↓
    Shows accessibility tree
    ↓
    Captures selectors
```

### Step 4: You Implement
```
Copy selectors from MCP
    ↓
    Paste into page object
    ↓
    Update test file
```

### Step 5: Run Tests
```
npm test -- tests/feature.spec.ts
    ↓
    Tests execute
    ↓
    View report
```

---

## Locator Strategies (MCP Will Show)

### Strategy 1: Role-Based (Most Recommended)
```typescript
this.page.getByRole('button', { name: 'Click' })
this.page.getByRole('textbox', { name: 'Email' })
```

### Strategy 2: Test ID (Best for Complex UIs)
```typescript
this.page.getByTestId('submit-button')
this.page.getByTestId('email-field')
```

### Strategy 3: Text-Based
```typescript
this.page.getByText('Sign In')
this.page.getByText('Login')
```

### Strategy 4: XPath (When Needed)
```typescript
this.page.locator('//button[text()="Click"]')
```

### Strategy 5: CSS (Last Resort)
```typescript
this.page.locator('.submit-button')
this.page.locator('input.email')
```

---

## Troubleshooting

### Issue: "npm run generate-tests not found"

**Solution:**
Update `package.json` scripts:
```json
{
  "scripts": {
    "generate-tests": "ts-node scripts/workflow-manager.ts"
  }
}
```

### Issue: Playwright MCP Not Available

**Solution:**
Ensure Playwright MCP is installed:
```bash
npm install @playwright/mcp
```

Configure in VS Code settings:
```json
{
  "mcp": {
    "mcpServers": {
      "playwright": {
        "command": "npx",
        "args": ["@playwright/mcp@latest"]
      }
    }
  }
}
```

### Issue: Generated Tests Timeout

**Solution:**
Update page object navigate method:
```typescript
public async navigate(): Promise<void> {
  await this.page.goto(this.baseUrl, { waitUntil: 'networkidle' });
  await this.page.waitForLoadState('domcontentloaded');
}
```

---

## Best Practices

### ✅ DO

- Use page objects for all interactions
- Keep locators private
- Make methods focused and single-purpose
- Add descriptive method names
- Use BDD structure (Given/When/Then)
- Write DRY (Don't Repeat Yourself) code
- Add JSDoc comments
- Test one feature per file

### ❌ DON'T

- Put assertions in page objects
- Hardcode test data
- Use brittle CSS selectors
- Create monolithic test files
- Skip documentation
- Mix test logic in page objects
- Ignore TypeScript types

---

## Commands Reference

```bash
# Generate new test suite
npm run generate-tests -- https://example.com "Feature" "feature"

# Run tests
npm test -- tests/feature.spec.ts

# Run with headed browser
npx playwright test tests/feature.spec.ts --headed

# Debug mode
npx playwright test tests/feature.spec.ts --debug

# Generate selectors interactively
npx playwright codegen https://example.com

# View test report
npx playwright show-report

# Run single test
npm test -- tests/feature.spec.ts -g "test name"

# Run with specific browser
npx playwright test --project=chromium
```

---

## Advanced Features

### Custom Test Case Generation

```typescript
import { TestGenerationWorkflow } from './scripts/workflow-manager';

const workflow = new TestGenerationWorkflow(
  'https://example.com',
  'Custom Feature'
);

workflow.addTestCases([
  {
    name: 'Custom Test 1',
    description: 'Description',
    steps: ['Step 1', 'Step 2'],
    assertions: ['Assert 1'],
    pageObjects: ['custom-feature']
  }
]);

workflow.execute();
```

### Programmatic Generation

```typescript
import { PlaywrightMCPAgent } from './scripts/generate-tests-agent';

const agent = new PlaywrightMCPAgent(
  'https://example.com',
  'Feature Name',
  'feature-name'
);

const files = agent.generateAll();
console.log(files);
```

---

## Examples

See [NBA Game Navigation Example](../PLAYWRIGHT_MCP_SUMMARY.md) for a complete working example with real test cases, page objects, and test results.

---

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the [Playwright documentation](https://playwright.dev)
3. Check the [MCP documentation](https://modelcontextprotocol.io)
4. Verify your page object implementation against the template

---

**Created:** May 24, 2026  
**Last Updated:** May 24, 2026  
**Status:** Production Ready
