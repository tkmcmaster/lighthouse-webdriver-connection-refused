import type { Frameworks, Services } from "@wdio/types";
import { LogLevel, log } from "./log";
import type { Context } from "mocha";
import LightHouseWDIO from "./lighthousewdio";
import { PluginConfiguration } from "../types";

export interface LightHouseWDIOServiceOptions extends WebdriverIO.ServiceOption, PluginConfiguration {
}

// WDIO Docs on creating a service
// https://webdriver.io/docs/customservices/
// https://github.com/webdriverio-boneyard/wdio-sauce-service
export class LightHouseWDIOService implements Services.ServiceInstance {
  protected browser?: WebdriverIO.Browser;
  public options: LightHouseWDIOServiceOptions;
  public capabilities: WebdriverIO.Capabilities;
  public config: WebdriverIO.Config;
  protected serviceId: string;
  /**
     * `serviceOptions` contains all options specific to the service
     * e.g. if defined as follows:
     *
     * ```
     * services: [['custom', { foo: 'bar' }]]
     * ```
     *
     * the `serviceOptions` parameter will be: `{ foo: 'bar' }`
     */
  constructor (
    serviceOptions: LightHouseWDIOServiceOptions,
    capabilities: WebdriverIO.Capabilities,
    config: WebdriverIO.Config
  ) {
    try {
    this.serviceId = "service" + Date.now();
    log("constructor called in service", LogLevel.DEBUG, { serviceId: this.serviceId, serviceOptions });
    log("constructor called in service", LogLevel.TRACE, { serviceId: this.serviceId, serviceOptions, capabilities, config });
    this.options = serviceOptions;
    this.capabilities = capabilities;
    this.config = config;
    LightHouseWDIO.setup(serviceOptions, capabilities, config);
    } catch (error) {
      log("Lighthouse Plugin constructor() error", LogLevel.ERROR, error);
      throw error;
    }
  }

  /**
   * this browser object is passed in here for the first time
   */
  async before (capabilities: WebdriverIO.Capabilities, specs: string[], browser: WebdriverIO.Browser) {
    try {
      log("before called in service", LogLevel.DEBUG, { capabilities, specs, browser });
      this.browser = browser;
      await LightHouseWDIO.before(browser);
    } catch (error) {
      log("Lighthouse Plugin before() error", LogLevel.ERROR, error);
      throw error;
    }
  }

  /**
   * Gets executed after all tests are done. You still have access to all global variables from
   * the test.
   * @param result        number of total failing tests
   * @param capabilities  list of capabilities details
   * @param specs         list of spec file paths that are to be run
   */
  async after (result: number, capabilities: WebdriverIO.Capabilities, specs: string[]) {
    try {
      log("after called in service", LogLevel.DEBUG, { result, capabilities, specs });
      await LightHouseWDIO.after(/* TODO: What do we need to pass */);
    } catch (error) {
      log("Lighthouse Plugin after() error", LogLevel.ERROR, error);
      throw error;
    }
  }

  /** something before each Mocha/Jasmine test run */
  async beforeTest (test: Frameworks.Test, context: Context) {
    try {
    const { title, parent, file } = test;
    log("beforeTest called in service", LogLevel.DEBUG, {
      serviceId: this.serviceId,
      sessionId: this.browser?.sessionId,
      title, parent, file,
      context: Object.keys(context)
    });
    await LightHouseWDIO.beforeEach(context, { title, parent });
    log("beforeTest service new session", LogLevel.DEBUG, {
      serviceId: this.serviceId,
      sessionId: this.browser?.sessionId,
      title, parent, file,
      context: Object.keys(context)
    });
    } catch (error) {
      log("Lighthouse Plugin beforeTest() error", LogLevel.ERROR, error);
      throw error;
    }
  }

  /** something after each Mocha/Jasmine test run */
  afterTest (test: Frameworks.Test, context: Context, result: Frameworks.TestResult) {
    try {
    const { title, parent, file } = test;
    log("afterTest called in service", LogLevel.DEBUG, {
      serviceId: this.serviceId,
      sessionId: this.browser?.sessionId,
      title, parent, file,
      context: Object.keys(context),
      result
    });
    LightHouseWDIO.afterEach(context, result, { title, parent });
    } catch (error) {
      log("Lighthouse Plugin afterTest() error", LogLevel.ERROR, error);
      throw error;
    }
  }
}

export default LightHouseWDIOService;
