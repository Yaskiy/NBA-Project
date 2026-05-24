/**
 * Playwright MCP Test Generation Workflow Manager
 * 
 * This manages the complete workflow for generating tests:
 * 1. Initialize agent with website URL
 * 2. Start interactive Playwright MCP session
 * 3. Record user interactions
 * 4. Generate test files and documentation
 */

import * as fs from 'fs';
import * as path from 'path';
import { PlaywrightMCPAgent, TestCaseConfig } from './generate-tests-agent';

export interface WorkflowStep {
  name: string;
  description: string;
  action: () => Promise<void>;
}

export interface WorkflowResult {
  success: boolean;
  message: string;
  files?: Record<string, string>;
  config?: any;
}

/**
 * Manages the complete test generation workflow
 */
export class TestGenerationWorkflow {
  private websiteUrl: string;
  private featureName: string;
  private filePrefix: string;
  private description: string;
  private agent: PlaywrightMCPAgent;
  private testCases: TestCaseConfig[] = [];
  private userJourneys: string[] = [];

  constructor(
    websiteUrl: string,
    featureName: string,
    filePrefix?: string,
    description?: string
  ) {
    this.websiteUrl = websiteUrl;
    this.featureName = featureName;
    this.filePrefix = filePrefix || this.sanitizeFileName(featureName);
    this.description = description || `Test suite for ${featureName}`;
    this.agent = new PlaywrightMCPAgent(
      this.websiteUrl,
      this.featureName,
      this.filePrefix,
      this.description,
      process.cwd()
    );
  }

  /**
   * Sanitize feature name to valid filename
   */
  private sanitizeFileName(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }

  /**
   * Add a test case to be generated
   */
  public addTestCase(testCase: TestCaseConfig): void {
    this.testCases.push(testCase);
    this.agent.addTestCase(testCase);
  }

  /**
   * Add multiple test cases
   */
  public addTestCases(testCases: TestCaseConfig[]): void {
    testCases.forEach(tc => this.addTestCase(tc));
  }

  /**
   * Add a user journey
   */
  public addUserJourney(journey: string): void {
    this.userJourneys.push(journey);
    this.agent.addUserJourney(journey);
  }

  /**
   * Add multiple user journeys
   */
  public addUserJourneys(journeys: string[]): void {
    journeys.forEach(j => this.addUserJourney(j));
  }

  /**
   * Execute the workflow
   */
  public async execute(): Promise<WorkflowResult> {
    try {
      // Validate inputs
      if (!this.websiteUrl) {
        throw new Error('Website URL is required');
      }
      if (!this.featureName) {
        throw new Error('Feature name is required');
      }

      // Generate files
      console.log('\n🎯 Starting Test Generation Workflow\n');
      console.log(`📍 Website: ${this.websiteUrl}`);
      console.log(`🎬 Feature: ${this.featureName}`);
      console.log(`📝 Test Cases: ${this.testCases.length}`);
      console.log(`🗺️  User Journeys: ${this.userJourneys.length}\n`);

      const files = this.agent.generateAll();

      return {
        success: true,
        message: `✅ Successfully generated test suite for ${this.featureName}`,
        files: {
          testFile: files.testFile,
          pageObjectFile: files.pageObjectFile,
          documentationFile: files.documentationFile,
          configFile: files.configFile,
        },
        config: this.agent.getConfig(),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        message: `❌ Error: ${message}`,
      };
    }
  }

  /**
   * Get workflow instructions
   */
  public getWorkflowInstructions(): string {
    return `
════════════════════════════════════════════════════════════════════════════════
    PLAYWRIGHT MCP TEST GENERATION WORKFLOW
════════════════════════════════════════════════════════════════════════════════

📋 Test Suite Generated for: ${this.featureName}
🔗 Website: ${this.websiteUrl}

NEXT STEPS:
───────────────────────────────────────────────────────────────────────────────

1️⃣  OPEN PAGE OBJECT FILE
   Location: src/pages/${this.filePrefix}.ts
   Task: 
   - Replace TODO comments with actual locators
   - Add private methods for element selection
   - Use Playwright locator strategies

2️⃣  IMPLEMENT PAGE OBJECT METHODS
   Example structure:
   
   // ==================== LOCATORS ====================
   private _button = (): Locator => this.page.getByRole('button', { name: 'Click' });
   
   // ==================== ACTIONS ====================
   public async clickButton(): Promise<void> {
     await this._button().click();
   }
   
   // ==================== ASSERTIONS ====================
   public async assertButtonVisible(): Promise<void> {
     await expect(this._button()).toBeVisible();
   }

3️⃣  UPDATE TEST FILE
   Location: tests/${this.filePrefix}.spec.ts
   Task:
   - Fill in test implementations
   - Use page object methods
   - Add proper assertions

4️⃣  START PLAYWRIGHT MCP IN COPILOT CHAT
   Steps:
   a) Open Copilot Chat (Ctrl+Shift+I)
   b) Send this prompt:
   
   ---
   I need to help with Playwright test implementation using Playwright MCP.
   
   Website: ${this.websiteUrl}
   Feature: ${this.featureName}
   Page Object Location: src/pages/${this.filePrefix}.ts
   Test File Location: tests/${this.filePrefix}.spec.ts
   
   Please use Playwright MCP to:
   1. Navigate to the website
   2. Help me identify locators for key elements
   3. Generate the locator selectors
   4. Suggest implementations for page object methods
   ---

5️⃣  RECORD USER INTERACTIONS
   In Copilot Chat with MCP:
   - Share the website URL
   - Click through the user journeys
   - Record each step
   - Generate selectors for elements

6️⃣  GENERATE LOCATORS AND METHODS
   For each element:
   - Get the selector from MCP
   - Add as private locator method
   - Create public action/assertion methods

7️⃣  RUN TESTS
   \`\`\`bash
   npm test -- tests/${this.filePrefix}.spec.ts
   \`\`\`

8️⃣  VIEW REPORT
   \`\`\`bash
   npx playwright show-report
   \`\`\`

════════════════════════════════════════════════════════════════════════════════

QUICK REFERENCE:
───────────────────────────────────────────────────────────────────────────────

📁 Generated Files:
   - tests/${this.filePrefix}.spec.ts (Test file)
   - src/pages/${this.filePrefix}.ts (Page object)
   - tests/${this.filePrefix.toUpperCase()}_TESTS_DOCS.md (Documentation)
   - .${this.filePrefix}-config.json (Configuration)

🎯 Locator Strategies (in order of preference):
   1. getByRole() - Most accessible
   2. getByTestId() - Explicit, stable
   3. getByText() - User-visible text
   4. locator() with XPath - For complex queries
   5. CSS selectors - Last resort

📝 Page Object Pattern:
   - Private locator methods: private _element = (): Locator => ...
   - Public action methods: public async doSomething(): Promise<void> => ...
   - Public assertion methods: public async assertCondition(): Promise<void> => ...

🧪 Test Structure:
   - Given: Setup/preconditions
   - When: Action being tested
   - Then: Expected result/assertion
   - And: Additional steps/verifications

════════════════════════════════════════════════════════════════════════════════

HELPFUL COMMANDS:
───────────────────────────────────────────────────────────────────────────────

# Run tests
npm test -- tests/${this.filePrefix}.spec.ts

# Run with headed browser
npx playwright test tests/${this.filePrefix}.spec.ts --headed

# Debug mode
npx playwright test tests/${this.filePrefix}.spec.ts --debug

# Generate new locators using Playwright
npx playwright codegen ${this.websiteUrl}

# Show test report
npx playwright show-report

# Run single test
npm test -- tests/${this.filePrefix}.spec.ts -g "test name"

════════════════════════════════════════════════════════════════════════════════
`;
  }
}

// Export for use as module
export { PlaywrightMCPAgent };

// CLI execution for standalone use
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error(`
Usage: ts-node workflow-manager.ts <website-url> <feature-name> [file-prefix] [description]

Examples:
  ts-node workflow-manager.ts https://example.com "User Login"
  ts-node workflow-manager.ts https://www.nba.com "Game Navigation" "game-navigation"
    `);
    process.exit(1);
  }

  const [websiteUrl, featureName, filePrefix, ...descriptionParts] = args;
  const description = descriptionParts.join(' ');

  const workflow = new TestGenerationWorkflow(
    websiteUrl,
    featureName,
    filePrefix,
    description
  );

  // Example: Add initial test cases
  workflow.addTestCases([
    {
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
      pageObjects: [filePrefix || featureName.toLowerCase().replace(/\\s+/g, '-')],
    },
  ]);

  // Example: Add user journeys
  workflow.addUserJourneys([
    `Navigate to ${websiteUrl} → Access ${featureName} → Verify loaded`,
  ]);

  // Execute workflow
  workflow.execute().then(result => {
    if (result.success) {
      console.log(result.message);
      console.log(workflow.getWorkflowInstructions());
    } else {
      console.error(result.message);
      process.exit(1);
    }
  });
}
