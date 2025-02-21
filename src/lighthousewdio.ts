import type { Config, Puppeteer, UserFlow, startFlow as startFlowFunction } from "lighthouse";
import { startFlow } from "lighthouse";
import {
  LightHouseResults,
  PluginConfiguration,
  Tags,
  WindowSize,
  windowSizeDesktop
} from "../types";
import { LogLevel, log } from "./log";
import type { Context } from "mocha";
import type { Frameworks } from "@wdio/types";
import { join as pathJoin } from "path";
import { mkdir, writeFile } from "fs/promises";
import { getPuppeteerPage } from "./puppeteer";

export async function createMainDirectory (mainDirName: string): Promise<void> {
  // Check to see if we have results directory, if we dont, create it
  await mkdir(mainDirName)
  .catch((error) => {
    if (error.code !== "EEXIST") {
      throw error;
    }
  });
}

export class LightHouseWDIO {
  protected browser?: WebdriverIO.Browser;
  protected beforeCalled: boolean = false;
  protected browserInitialized: boolean = false;
  protected overwriteCommandRun: boolean = false;
  protected lighthouseResultFileName: string = "lighthouse-results-file";
  protected resultsDir: string = "lighthouse-results";
  protected userFlow?: UserFlow;
  public currentPage?: LightHouseResults;
  protected currentTimer?: string; // Needs to be a string so we can save a snapshot when we end the timer
  public pages: LightHouseResults[] = [];
  protected windowSize: WindowSize;
  protected capabilities?: WebdriverIO.Capabilities;
  protected config?: WebdriverIO.Config;
  constructor () {
    this.windowSize = windowSizeDesktop;
  }
  public getResultsDir (): string {
    return this.resultsDir;
  }

  public setup (
    launchOptions: PluginConfiguration,
    capabilities: WebdriverIO.Capabilities,
    config: WebdriverIO.Config
  ) {
    if (this.beforeCalled) {
      throw new Error("setup() must be called before the \"before\" method");
    }
    // Even though the wdio.conf can have an array. We only get the ONE capability that is running
    this.capabilities = capabilities as WebdriverIO.Capabilities;
    this.config = config;
    const {
      windowSize,
      resultsDirectory
    } = launchOptions;
    if (windowSize) {
      this.windowSize = windowSize;
      log("windowSize", LogLevel.DEBUG, { windowSize });
    }
    if (resultsDirectory) {
      this.resultsDir = resultsDirectory;
      log("resultsDirectory", LogLevel.DEBUG, { resultsDirectory, resultsDir: this.resultsDir });
    }
  }

  /**
   * @deprecated Don't use this method if *wdio-pagestats-service* is enabled.
   */
  public async before (browser: WebdriverIO.Browser): Promise<void> {
    this.beforeCalled = true;
    this.browser = browser;
    log("before called in class", LogLevel.DEBUG, { configUrl: this.config?.baseUrl, browserUrl: browser.options.baseUrl });
    if (this.config && !this.config.baseUrl && browser.options.baseUrl) {
      this.config.baseUrl = browser.options.baseUrl;
    }
    await createMainDirectory(this.resultsDir);
  }

  protected async browserInitialize () {
    if (this.browser && !this.overwriteCommandRun) {
      // https://webdriver.io/docs/api/browser/addCommand/
      // https://webdriver.io/docs/typescript/#adding-custom-commands (see index.ts)
      this.browser.overwriteCommand("url", this.runLighthouse.bind(this));
      this.overwriteCommandRun = true;
    }
    if (this.browser && !this.browserInitialized) {
      await this.browser.setWindowSize(this.windowSize.width, this.windowSize.height);

      // await this.browser.url( "about:blank" );
      this.browserInitialized = true;
    }
  }

  /**
   * @deprecated Don't use this method if *wdio-pagestats-service* is enabled.
   */
  public async beforeEach (context: Context, tags: { title: string, parent: string } & Tags): Promise<void> {
    // This check should make sure browser is initialized at this point
    if (!this.beforeCalled) {
      log("before() must be called prior beforeEach()", LogLevel.ERROR);
      throw new Error("before() must be called prior beforeEach()");
    }
    try {
      log("beforeTest called in class", LogLevel.DEBUG, { configUrl: this.config?.baseUrl, browserUrl: this.browser?.options.baseUrl });
      if (this.browser === undefined) {
        throw new Error("before() must be called prior beforeTest()");
      }
      await this.browserInitialize();
    } catch (error: unknown) {
      log("LightHouseWDIO beforeTest() error", LogLevel.ERROR, error);
      throw error;
    }

    log("beforeTest called in class finished", LogLevel.DEBUG);
  }

  protected async writeResults (lightHouseResult: LightHouseResults): Promise<void> {
    const { lighthouseComprehensiveResult, lighthouseJSONResult } = lightHouseResult;

    const now = Date.now();
    const htmlFilename: string = pathJoin(this.resultsDir, `test-${now}.html`);

    log("writeResults", LogLevel.DEBUG, {
      ...lightHouseResult,
      lighthouseComprehensiveResult: lighthouseComprehensiveResult !== undefined,
      lighthouseJSONResult: lighthouseJSONResult !== undefined,
      htmlFilename
    });

    const fsWritePromises: Promise<void>[] = [];
    if (lighthouseJSONResult !== undefined) {
      try {
        // Save JSON file to disk
        // We need a different name so the controller doesn't think it's a pagestats file
        const jsonFilename: string = pathJoin(this.resultsDir, `test-${now}.json`);
        fsWritePromises.push(writeFile(jsonFilename, JSON.stringify(lighthouseJSONResult)).catch((error: unknown) => {
          log(`Failed to write JSON file ${jsonFilename}`, LogLevel.ERROR, error);
        }));
        // Log to Splunk
        // Save the splunkData so we can validate in tests
      } catch (error) {
        log("logSplunkPage failed", LogLevel.ERROR, error, { lighthouseJSONResult });
      }
    } else {
      // We didn't get any results.
      log("No json results found to write", LogLevel.WARN);
    }
    if (lighthouseComprehensiveResult !== undefined) {
      // TODO: Do we need for loop iterate through map results? AKA do we move this functionality on the before instead of beforeEach?
      // Log HTML file
      fsWritePromises.push(writeFile(htmlFilename, lighthouseComprehensiveResult).catch((error) => {
        log(`Failed to write HTML file ${htmlFilename} - ${error}`, LogLevel.ERROR, error);
        throw error;
      }));
    } else {
      log("No html results found to write", LogLevel.WARN);
    }
    await Promise.all(fsWritePromises);
  }

  /**
   * @deprecated Don't use this method if *wdio-pagestats-service* is enabled.
   */
  // eslint-disable-next-line require-await
  public async afterEach (context: Context, result: Frameworks.TestResult, tags: { title: string, parent: string } & Tags): Promise<void> {
    const mochaTestid = context.mochaTestid;
    const { title, parent } = tags;
    log("afterTest called in class", LogLevel.DEBUG, { mochaTestid, ...tags, pagesLength: this.pages.length });

    // TODO: Do we want some kind of skipException for tests that can't run because of a predecessor?
    // TODO: Check if the testInfo already has a passedMessage
    const message = `${parent} - ${title} ${result.passed ? "passed" : "failed"} in ${result.duration} ms`;
    log(message, LogLevel.INFO);
    if (result.error) {
      log(typeof result.error?.message === "string"
        ? result.error.message
        : JSON.stringify(result.error), LogLevel.ERROR);
      if (typeof result.error?.message === "string" && typeof result.error?.matcherResult?.message === "string"
        && result.error?.message !== result.error?.matcherResult?.message) {
        log(result.error?.matcherResult?.message, LogLevel.ERROR);
      }
    }
    log("afterEach() finished", LogLevel.DEBUG);
  }

  /**
   * @deprecated Don't use this method if *wdio-pagestats-service* is enabled.
   */
  public async after (): Promise<void> {
    log("after called in class", LogLevel.DEBUG, { pagesLength: this.pages.length });
    // close off the old page/flow if there is one
    await this.endUserFlow().catch(() => { /* no op, logs itself */ });
    log("after finished in class", LogLevel.DEBUG);
  }

  /** Creates a new this.userFlow if it's undefined.
   * If one exists it does nothing since we need to generate a report before getting rid of the old one. */
  protected async startUserFlow (currentPage: LightHouseResults): Promise<UserFlow> {
    if (this.browser === undefined) {
      log("Browser not initialized.", LogLevel.ERROR);
      throw new Error("before() must be called prior runLighthouse()");
    }
    // close off the old page/flow and create a new one
    await this.endUserFlow().catch(() => { /* no op, logs itself */ });

    // Set Lighthouse emulation configurations - needs to be called "config"
    const config: Config = {
      extends: "lighthouse:default",
      settings: {
        formFactor: "desktop",
        throttling: {
          rttMs: 0,
          throughputKbps: 0, // 1 * 1024 * 1024,
          cpuSlowdownMultiplier: 1,
          requestLatencyMs: 0,
          downloadThroughputKbps: 0,
          uploadThroughputKbps: 0
        },
        screenEmulation: {
          width: this.windowSize.width,
          height: this.windowSize.height,
          mobile: false,
          deviceScaleFactor: 1,
          disabled: false
        },
        // emulatedUserAgent: this.lighthouseLaunchOptions.emulatedUserAgent,
        networkQuietThresholdMs: 2000,
        cpuQuietThresholdMs: 2000,
        maxWaitForLoad: 270000 // 4.5 minutes
      }
    };

    const page = (await getPuppeteerPage());

    // Start Lighthouse flow
    // BUG: https://github.com/GoogleChrome/lighthouse/issues/15044
    // const { startFlow } = await import("lighthouse");
    // const { startFlow }: { startFlow: typeof startFlowFunction } = await import("lighthouse/core/index.cjs");

    this.currentPage = currentPage;
    log("startUserFlow", LogLevel.INFO, { config, startFlow: typeof startFlow });
    this.userFlow = await startFlow(
      page as unknown as Puppeteer.Page,
      { config, name: `UserFlow Start`}
    );
    return this.userFlow!;
  }

  /**
   * Checks if there's a current open click timer and ends it and creates a new snapshot
   */
  protected async endTimer (userFlow: UserFlow | undefined = this.userFlow): Promise<void> {
    if (this.currentTimer) {
      log("endTimer start", LogLevel.DEBUG, { currentTimer: typeof this.currentTimer, userFlow: typeof userFlow });
      // endTimespan seems to take a while. Save it off local and then reset it so it's not blocking the next test
      const currentTimer = this.currentTimer;
      this.currentTimer = undefined;
      try {
        if (!userFlow) {
          throw new Error("endTimer called without a userFlow");
        }
        log("endTimer endTimespan", LogLevel.DEBUG, { currentTimer: typeof currentTimer, userFlow: typeof userFlow });
        await userFlow.endTimespan();
        log("endTimer snapshot", LogLevel.DEBUG, { currentTimer: typeof currentTimer, userFlow: typeof userFlow });
        // https://github.com/GoogleChrome/lighthouse/blob/main/docs/user-flows.md
        await userFlow.snapshot({ name: currentTimer + " snapshot" });
        log("endTimer snapshot finished", LogLevel.DEBUG, { currentTimer: typeof currentTimer, userFlow: typeof userFlow });
      } catch (error) {
        log("endTimer error", LogLevel.ERROR, error);
      } finally {
        log("endTimer finished", LogLevel.DEBUG, { currentTimer: typeof currentTimer, userFlow: typeof userFlow });
      }
    }
  }

  /**
   * Checks if there's a current userFlow and closes it out and logs it to the currentPage
   */
  protected async endUserFlow (): Promise<void> {
    log("endUserFlow start", LogLevel.DEBUG, { currentPage: typeof this.currentPage, userFlow: typeof this.userFlow });
    if (!this.userFlow) {
      if (this.currentPage) {
        log("endUserFlow with no userFlow has currentPage", LogLevel.WARN);
        this.currentPage = undefined;
      }
      if (this.currentTimer) {
        log("endUserFlow with no userFlow has currentTimer", LogLevel.WARN);
        this.currentTimer = undefined;
      }
      return;
    }
    // saving off the reports seems to take a while. Save it off local and then reset it so it's not blocking the next test
    const userFlow = this.userFlow;
    const currentPage = this.currentPage;
    this.userFlow = undefined;
    this.currentPage = undefined;
    try {
      if (!currentPage) {
        throw new Error("endUserFlow called without a currentPage");
      }
      // If there's a timer we need to close of, close it off. We need to pass it in since we wipe out the member var
      await this.endTimer(userFlow);
      // Get the comprehensive flow report.
      currentPage.lighthouseComprehensiveResult = await userFlow.generateReport();

      // Create and get JSON result for Splunk.
      currentPage.lighthouseJSONResult = await userFlow.createFlowResult();
      log("lighthouseJSONResult", LogLevel.TRACE, currentPage.lighthouseJSONResult);
    } catch (error) {
      log("endUserFlow error", LogLevel.ERROR, error);
    } finally {
      const lighthouseComprehensiveResult: boolean = currentPage?.lighthouseComprehensiveResult !== undefined;
      const lighthouseJSONResult: boolean = currentPage?.lighthouseJSONResult !== undefined;
      if (currentPage?.lighthouseJSONResult) {
        currentPage.lighthouseJSONResult.steps.forEach((step, stepIndex) => {
          if (typeof step.lhr.categories.performance?.score !== "number") {
            log(`Error: Score is null in step ${stepIndex}`, LogLevel.WARN);
          }
          if (step.lhr.runWarnings && Array.isArray(step.lhr.runWarnings)) {
            step.lhr.runWarnings.forEach(runWarning => {
              log(runWarning, LogLevel.WARN);
            });
          }
        });
      }
      if (currentPage) {
        try {
          await this.writeResults(currentPage);
        } catch (error) {
          log("Failed to write result files", LogLevel.ERROR, error);
        }
      }
      log(
        "endUserFlow() finished",
        lighthouseComprehensiveResult && lighthouseJSONResult ? LogLevel.DEBUG : LogLevel.WARN, {
        ...currentPage,
        lighthouseComprehensiveResult,
        lighthouseJSONResult
      });
    }
  }

  /**
   * Overrides the default browser.url() to force a wait for fully loaded by default
   * perfUrl can override the waitForType
   * @param originalCommand "original URL command"
   * @param path url/path to access
   * @returns the result of browser.url()
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  public async runLighthouse (originalCommand: Function, path: string): Promise<void> {

    if (this.browser === undefined) {
      log("Browser not initialized.", LogLevel.ERROR);
      throw new Error("before() must be called prior runLighthouse()");
    }
    log("browser.runLighthouse: " + path, LogLevel.DEBUG, { path });

    // Short circuit about:blank
    if (path.startsWith("about:")) {
      return originalCommand.call(this.browser, path);
    }

    try {
      path = new URL(path, this.config?.baseUrl).toString();
    } catch (error) {
      log("browser.runLighthouse new URL error", LogLevel.ERROR, error, { path, baseUrl: this.config?.baseUrl });
    }

    const lightHouseResult: LightHouseResults = {};

    try {
      const flow: UserFlow = await this.startUserFlow(lightHouseResult);

      await flow.navigate(path, {
        name: `Cold Cache Navigation - ${path}`,
        // Always do this. We'll have a fresh browser for each test and want preload to be able to cache
        disableStorageReset: true
      });
      log(`Cold Cache Run Called`, LogLevel.DEBUG);
    } catch (error) {
      log(`Failed to runLighthouse() - ${error}`, LogLevel.ERROR, error);
      throw error;
    } finally {
      this.pages.push(lightHouseResult);
      log("runLighthouse() finished", LogLevel.DEBUG, lightHouseResult);
    }
  }
}

export default new LightHouseWDIO();
