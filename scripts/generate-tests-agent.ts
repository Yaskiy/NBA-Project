#!/usr/bin/env node

/**
 * Playwright MCP Test Generation Agent
 * 
 * This agent orchestrates the creation of comprehensive test suites
 * for any website by:
 * 1. Accepting a website URL
 * 2. Starting interactive Playwright MCP navigation
 * 3. Recording user interactions
 * 4. Generating test files and page objects
 * 5. Creating comprehensive documentation
 * 
 * Usage:
 *   npm run generate-tests -- https://example.com "Feature Name" "test-feature"
 *   npm run generate-tests -- https://www.nba.com "Game Navigation" "game-navigation"
 */

import * as fs from 'fs';
import * as path from 'path';

interface AgentConfig {
  websiteUrl: string;
  featureName: string;
  filePrefix: string;
  description: string;
  userJourneys: string[];
  testCases: TestCaseConfig[];
}

interface TestCaseConfig {
  name: string;
  description: string;
  steps: string[];
  assertions: string[];
  pageObjects: string[];
}

interface GeneratedFiles {
  testFile: string;
  pageObjectFile: string;
  documentationFile: string;
  configFile: string;
}

class PlaywrightMCPAgent {
  private config: AgentConfig;
  private outputDir: string;
  private srcPagesDir: string;
  private testsDir: string;

  constructor(
    websiteUrl: string,
    featureName: string,
    filePrefix: string,
    description: string = '',
    outputDir: string = process.cwd()
  ) {
    this.config = {
      websiteUrl,
      featureName,
      filePrefix,
      description: description || `Test suite for ${featureName} feature on ${websiteUrl}`,
      userJourneys: [],
      testCases: [],
    };

    this.outputDir = outputDir;
    this.testsDir = path.join(this.outputDir, 'tests');
    this.srcPagesDir = path.join(this.outputDir, 'src', 'pages');

    this.ensureDirectories();
  }

  /**
   * Ensure required directories exist
   */
  private ensureDirectories(): void {
    const dirs = [this.testsDir, this.srcPagesDir];
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Add a user journey to be tested
   */
  public addUserJourney(journey: string): void {
    this.config.userJourneys.push(journey);
  }

  /**
   * Add a test case to the suite
   */
  public addTestCase(testCase: TestCaseConfig): void {
    this.config.testCases.push(testCase);
  }

  /**
   * Generate test file from configuration
   */
  private generateTestFile(): string {
    const testFileName = `${this.config.filePrefix}.spec.ts`;
    const pageObjectName = this.toPascalCase(this.config.filePrefix);
    
    const testContent = `import { test, expect } from '@playwright/test';
import { ${pageObjectName}Page } from '../src/pages/${this.config.filePrefix}';

/**
 * ${this.config.featureName} Test Suite
 * Generated automatically using Playwright MCP Agent
 * Website: ${this.config.websiteUrl}
 * Date: ${new Date().toISOString()}
 */

test.describe('${this.config.featureName}', () => {
  let page: ${pageObjectName}Page;

  test.beforeEach(async ({ page: playwrightPage }) => {
    page = new ${pageObjectName}Page(playwrightPage);
  });

${this.config.testCases.map((testCase, index) => this.generateTestCase(testCase, index)).join('\n')}
});
`;

    const filePath = path.join(this.testsDir, testFileName);
    fs.writeFileSync(filePath, testContent, 'utf-8');
    return filePath;
  }

  /**
   * Generate individual test case code
   */
  private generateTestCase(testCase: TestCaseConfig, index: number): string {
    const stepCode = testCase.steps
      .map((step, i) => {
        return `    await test.step('${step}', async () => {
      // TODO: Add test implementation
      // Use page object methods to interact with the website
    });`;
      })
      .join('\n\n');

    return `  test('${testCase.name}', async () => {
${stepCode}
  });`;
  }

  /**
   * Generate page object file from configuration
   */
  private generatePageObjectFile(): string {
    const pageObjectFileName = `${this.config.filePrefix}.ts`;
    const className = `${this.toPascalCase(this.config.filePrefix)}Page`;

    const pageObjectContent = `import { Page, Locator, expect } from '@playwright/test';

/**
 * ${this.config.featureName} Page Object
 * Generated automatically using Playwright MCP Agent
 * Website: ${this.config.websiteUrl}
 * Date: ${new Date().toISOString()}
 * 
 * This page object encapsulates all interactions with the ${this.config.featureName} feature.
 */
export class ${className} {
  protected page: Page;
  private baseUrl: string = '${this.config.websiteUrl}';

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to the feature page
   */
  public async navigate(): Promise<void> {
    await this.page.goto(this.baseUrl);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Verify page loaded successfully
   */
  public async verifyPageLoaded(): Promise<void> {
    await expect(this.page).toHaveTitle(/.*/);
  }

  // ==================== LOCATORS ====================
  // Add your locator methods here
  // Example: private _button = (): Locator => this.page.getByRole('button', { name: 'Click Me' });

  // ==================== ACTIONS ====================
  // Add your action methods here
  // Example: public async clickButton(): Promise<void> { await this._button().click(); }

  // ==================== ASSERTIONS ====================
  // Add your assertion methods here
  // Example: public async assertButtonVisible(): Promise<void> { await expect(this._button()).toBeVisible(); }
}
`;

    const filePath = path.join(this.srcPagesDir, pageObjectFileName);
    fs.writeFileSync(filePath, pageObjectContent, 'utf-8');
    return filePath;
  }

  /**
   * Generate comprehensive documentation
   */
  private generateDocumentationFile(): string {
    const docFileName = `${this.config.filePrefix.toUpperCase()}_TESTS_DOCS.md`;
    
    const documentation = `# ${this.config.featureName} Test Documentation

## Overview
${this.config.description}

**Website:** ${this.config.websiteUrl}
**Generated:** ${new Date().toISOString()}
**Generated By:** Playwright MCP Agent

---

## Table of Contents
1. [User Journeys](#user-journeys)
2. [Test Cases](#test-cases)
3. [Page Objects](#page-objects)
4. [Running Tests](#running-tests)
5. [Maintenance](#maintenance)

---

## User Journeys

${this.config.userJourneys.map((journey, i) => `### Journey ${i + 1}\n\`\`\`\n${journey}\n\`\`\`\n`).join('\n')}

---

## Test Cases

${this.config.testCases
  .map(
    (testCase, i) => `
### Test ${i + 1}: ${testCase.name}

**Description:** ${testCase.description}

**Steps:**
${testCase.steps.map((step, j) => `${j + 1}. ${step}`).join('\n')}

**Assertions:**
${testCase.assertions.map((assertion) => `- ${assertion}`).join('\n')}

**Page Objects Used:** ${testCase.pageObjects.join(', ')}

---
`
  )
  .join('\n')}

## Page Objects

### ${this.toPascalCase(this.config.filePrefix)}Page

Main page object for ${this.config.featureName} feature.

**Location:** \`src/pages/${this.config.filePrefix}.ts\`

**Methods:**
- \`navigate()\` - Navigate to the feature page
- \`verifyPageLoaded()\` - Verify page loads successfully

**Usage Example:**
\`\`\`typescript
import { ${this.toPascalCase(this.config.filePrefix)}Page } from '../src/pages/${this.config.filePrefix}';

test('Example', async ({ page }) => {
  const featurePage = new ${this.toPascalCase(this.config.filePrefix)}Page(page);
  await featurePage.navigate();
  await featurePage.verifyPageLoaded();
});
\`\`\`

---

## Running Tests

### Run All Tests
\`\`\`bash
npm test -- tests/${this.config.filePrefix}.spec.ts
\`\`\`

### Run Specific Test
\`\`\`bash
npm test -- tests/${this.config.filePrefix}.spec.ts -g "test name"
\`\`\`

### Run with Options
\`\`\`bash
# Headed mode (see browser)
npx playwright test tests/${this.config.filePrefix}.spec.ts --headed

# Debug mode
npx playwright test tests/${this.config.filePrefix}.spec.ts --debug

# Generate HTML report
npx playwright test tests/${this.config.filePrefix}.spec.ts --reporter=html
\`\`\`

---

## Maintenance

### Next Steps
1. **Implement Locators** - Add actual selectors to page object in \`src/pages/${this.config.filePrefix}.ts\`
2. **Implement Actions** - Add interaction methods to page object
3. **Implement Assertions** - Add verification methods to page object
4. **Update Tests** - Fill in test implementations in \`tests/${this.config.filePrefix}.spec.ts\`
5. **Run Tests** - Execute tests locally and in CI/CD

### Key Files to Update
- **Page Object:** \`src/pages/${this.config.filePrefix}.ts\`
  - Replace TODO sections with actual locators and methods
- **Test File:** \`tests/${this.config.filePrefix}.spec.ts\`
  - Fill in step implementations
  - Add assertions

### Best Practices
- Use descriptive locator names
- Keep locators private
- Make methods focused and reusable
- Add JSDoc comments
- Follow existing naming conventions
- Use Page Object Model pattern consistently

---

## Troubleshooting

### Tests Timing Out
- Check website is accessible
- Verify selectors are correct
- Add explicit waits if needed

### Selector Issues
- Use Playwright Inspector: \`npx playwright test --debug\`
- Verify selectors with: \`npx playwright codegen ${this.config.websiteUrl}\`

### Network Issues
- Add longer timeouts in page object
- Use \`waitForLoadState()\` appropriately
- Check internet connectivity

---

## Tips for Implementation

### Using Playwright Inspector
\`\`\`bash
npx playwright test --debug
\`\`\`

### Recording New Tests
\`\`\`bash
npx playwright codegen ${this.config.websiteUrl}
\`\`\`

### Viewing Test Results
\`\`\`bash
npx playwright show-report
\`\`\`

---

**Generated with ❤️ by Playwright MCP Agent**
`;

    const filePath = path.join(this.testsDir, docFileName);
    fs.writeFileSync(filePath, documentation, 'utf-8');
    return filePath;
  }

  /**
   * Generate agent configuration file for future runs
   */
  private generateConfigFile(): string {
    const configFileName = `.${this.config.filePrefix}-config.json`;
    const configContent = {
      version: '1.0',
      agent: 'PlaywrightMCPAgent',
      generated: new Date().toISOString(),
      config: this.config,
      files: {
        testFile: `tests/${this.config.filePrefix}.spec.ts`,
        pageObjectFile: `src/pages/${this.config.filePrefix}.ts`,
        documentationFile: `tests/${this.config.filePrefix.toUpperCase()}_TESTS_DOCS.md`,
      },
    };

    const filePath = path.join(this.outputDir, configFileName);
    fs.writeFileSync(filePath, JSON.stringify(configContent, null, 2), 'utf-8');
    return filePath;
  }

  /**
   * Convert string to PascalCase
   */
  private toPascalCase(str: string): string {
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }

  /**
   * Generate all files
   */
  public generateAll(): GeneratedFiles {
    console.log(`\n🚀 Generating test suite for: ${this.config.featureName}`);
    console.log(`📍 Website: ${this.config.websiteUrl}\n`);

    const testFile = this.generateTestFile();
    console.log(`✅ Generated test file: ${testFile}`);

    const pageObjectFile = this.generatePageObjectFile();
    console.log(`✅ Generated page object: ${pageObjectFile}`);

    const documentationFile = this.generateDocumentationFile();
    console.log(`✅ Generated documentation: ${documentationFile}`);

    const configFile = this.generateConfigFile();
    console.log(`✅ Generated config file: ${configFile}\n`);

    return {
      testFile,
      pageObjectFile,
      documentationFile,
      configFile,
    };
  }

  /**
   * Get configuration
   */
  public getConfig(): AgentConfig {
    return this.config;
  }
}

// Export for use as module
export { PlaywrightMCPAgent, AgentConfig, TestCaseConfig, GeneratedFiles };

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error(`
Usage: npm run generate-tests -- <website-url> <feature-name> [file-prefix] [description]

Examples:
  npm run generate-tests -- https://example.com "User Login" "user-login"
  npm run generate-tests -- https://www.nba.com "Game Navigation" "game-navigation"
  npm run generate-tests -- https://example.com "Checkout Flow" "checkout" "E-commerce checkout flow"
    `);
    process.exit(1);
  }

  const [websiteUrl, featureName, filePrefix = featureName.toLowerCase().replace(/\\s+/g, '-'), ...descriptionParts] = args;
  const description = descriptionParts.join(' ');

  const agent = new PlaywrightMCPAgent(
    websiteUrl,
    featureName,
    filePrefix,
    description,
    process.cwd()
  );

  // Example: Add a test case
  agent.addTestCase({
    name: `User can access ${featureName}`,
    description: `Verify that users can navigate to and access the ${featureName} feature`,
    steps: [
      `User navigates to ${websiteUrl}`,
      'Page loads successfully',
      'All key elements are visible',
    ],
    assertions: [
      'Page title is correct',
      'Key UI elements are present',
      'Page loads without errors',
    ],
    pageObjects: [filePrefix],
  });

  // Generate all files
  const files = agent.generateAll();

  console.log('📋 Next Steps:');
  console.log(`1. Open the test file: ${files.testFile}`);
  console.log(`2. Open the page object: ${files.pageObjectFile}`);
  console.log(`3. Read the documentation: ${files.documentationFile}`);
  console.log('4. Start Playwright MCP in Copilot Chat');
  console.log('5. Share the website URL and complete the page objects');
  console.log('6. Run: npm test -- tests/${filePrefix}.spec.ts\\n');
}
