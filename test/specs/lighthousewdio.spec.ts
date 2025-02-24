import { LightHouseWDIO, PluginConfiguration } from "../../src/index";
import { LogLevel, log } from "../../src/log";
import type { Context } from "mocha";

describe("LightHouseWDIO Shared", () => {
  const lighthouseWDIO: LightHouseWDIO = new LightHouseWDIO();
  const launchOptions: PluginConfiguration = {
    resultsDirectory: process.env.RESULTS_PATH || "lighthouse-results",
  };

  before (async () => {
    const capabilities = {};
    lighthouseWDIO.setup(launchOptions, capabilities, { capabilities: [capabilities] });
    await lighthouseWDIO.before(browser);
  });

  beforeEach(async () => {
    await lighthouseWDIO.beforeEach(this as any as Context, { title: "test", parent: "LightHouseWDIO Shared" });
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
