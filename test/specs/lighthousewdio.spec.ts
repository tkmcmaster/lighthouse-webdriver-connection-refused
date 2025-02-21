import { LightHouseResults, LightHouseWDIO, PluginConfiguration, windowSizeDesktop } from "../../src/index";
import { LogLevel, log } from "../../src/log";
import type { Context } from "mocha";
import { createTestId } from "../../src/lib";
import { expect } from "expect-webdriverio";

describe("LightHouseWDIO Shared", () => {
  const describeName = "LightHouseWDIO Shared";
  const getUniqueId = (): string | undefined => (this as any as Context)?.mochaTestid;
  const lighthouseWDIO: LightHouseWDIO = new LightHouseWDIO();
  // Save the pages off as we go since the "after()" clears the maps
  const launchOptions: PluginConfiguration = {
    resultsDirectory: process.env.RESULTS_PATH || "lighthouse-results",
    windowSize: windowSizeDesktop,
    userAgent: "Lighthouse Plugin Config"
  };

  before (async () => {
    const capabilities = {};
    lighthouseWDIO.setup(launchOptions, capabilities, { capabilities: [capabilities] });
    await lighthouseWDIO.before(browser);
  });

  after (async () => {
    // Save the pages off since the "after()" will clear the map
    await lighthouseWDIO.after();
  });

  let startTime: number;
  beforeEach(async () => {
    counter++;
    await lighthouseWDIO.beforeEach(this as any as Context, { title: "test" + counter, parent: describeName });
    log("beforeEach mochaTestid: " + getUniqueId(), LogLevel.DEBUG);
    startTime = Date.now();
  });

  let counter = 0;
  afterEach(async () => {
    await lighthouseWDIO.afterEach(
      this as any as Context,
      { passed: true, duration: Date.now() - startTime, retries: { attempts: 1, limit: 0 }, exception: "", status: "" },
      { title: "test" + counter, parent: describeName }
    );
  });

  it("Should log single page", async () => {
    try {
      await browser.url("https://beta.familysearch.org/en/united-states/");
      await browser.$("body").waitForDisplayed();
      await browser.$("//body").waitForDisplayed();
    } catch (error: unknown) {
      log("single page error", LogLevel.ERROR, error);
      throw error;
    }
  });

});
