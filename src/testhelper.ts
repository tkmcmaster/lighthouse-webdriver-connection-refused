import {
  AdditionalHeaders,
  HelperDefaults,
  PerformancePlugin,
  PluginDefaults,
  TestErrorSeverity
} from "../types";
import { LogLevel, log } from "./log";
import { Suite as MochaSuite, Test as MochaTest } from "mocha";
import type { Selector, WaitUntilOptions } from "webdriverio";
import { getHelperCdpClient, getPuppeteerPage } from "./puppeteer";
import type CDP from "devtools-protocol";
import type { Cookie as PuppeteerCookie } from "puppeteer-core";

// Warning: If you update these defaults, update the javascript docs for HelperDefaults and PluginDefaults
export const DEFAULT_WAIT_TIMEOUT: number = parseInt(process.env.DEFAULT_WAIT_TIMEOUT || "") || 120000;
export const DEFAULT_ASSERT_TIMEOUT: number = parseInt(process.env.DEFAULT_ASSERT_TIMEOUT || "") || 10;
export const DEFAULT_CLICKABLE_TIMEOUT: number = parseInt(process.env.DEFAULT_CLICKABLE_TIMEOUT || "") || 1000;
export const DEFAULT_VISUALLY_COMPLETE_INTERVAL: number = parseInt(process.env.DEFAULT_VISUALLY_COMPLETE_INTERVAL || "") || 1.9;
export const DEFAULT_FULLY_LOADED_INTERVAL: number = parseInt(process.env.DEFAULT_FULLY_LOADED_INTERVAL || "") || 2000;
export const helperDefaults: HelperDefaults = {
  assertTimeout: DEFAULT_ASSERT_TIMEOUT,
  assertClickableTimeout: DEFAULT_CLICKABLE_TIMEOUT,
  customHeaders: undefined
};

export const pluginDefaults: PluginDefaults = {
  waitTimeout: DEFAULT_WAIT_TIMEOUT,
  visuallyCompleteInterval: DEFAULT_VISUALLY_COMPLETE_INTERVAL,
  fullyLoadedInterval: DEFAULT_FULLY_LOADED_INTERVAL
};

/**
 * Resets the `helperDefaults` back to defults: `assertTimeout` = `DEFAULT_ASSERT_TIMEOUT`,
 * `assertClickableTimeout` = `DEFAULT_CLICKABLE_TIMEOUT`, `customHeaders` = `undefined`
 */
export function resetHelperDefaults () {
  helperDefaults.assertTimeout = DEFAULT_ASSERT_TIMEOUT;
  helperDefaults.assertClickableTimeout = DEFAULT_CLICKABLE_TIMEOUT;
  helperDefaults.customHeaders = undefined;
}

/**
 * Checks whether all the provided WebdriverIO `elector(s) exist on the page. If they do not,
 * it logs them as test errors on the page and rethrows. Uses `<WebdriverElement>.waitForExist()`
 * @param selectors Array of WebdriverIO selectors to check if they exist on the page
 */
export async function assertElementsExist (...selectors: Selector[]) {
  const puppeteerPage = await getPuppeteerPage();
  const isLighthouse: boolean = (browser && typeof (browser as unknown as PerformancePlugin).getGlobalTags === "function")
    && (await (browser as unknown as PerformancePlugin).getGlobalTags()).plugin === "lighthouse";
  // puppeteer waitForSelector fails with 1ms, 10ms seems to be long enough default
  const timeout = helperDefaults.assertTimeout + (isLighthouse ? 10 : 0);
  log("assertElementsExist isLighthouse: " + isLighthouse, LogLevel.WARN, { timeout, selectors });
  // All settled to log all failures
  await Promise.allSettled(
    selectors.map((selector) => {
      log("assertElementsExist selector: " + selector, LogLevel.WARN, { isLighthouse, typeofSelector: typeof selector, selector });
      return (isLighthouse && typeof selector === "string" && !selector.includes("*=")
        ? (selector.startsWith("//")
          ? puppeteerPage.waitForSelector(`::-p-xpath(${selector})`, { timeout })
          : puppeteerPage.waitForSelector(selector, { timeout })
        )
        : browser.$(selector).waitForExist({ timeout })
      ).then((value) => {
        log("assertElementsExist success selector: " + selector, LogLevel.WARN, { isLighthouse, value });
        return value;
      }).catch((e: unknown) => {
        const message = e instanceof Error ? e.message : `${e}`;
        log(message, LogLevel.WARN, e);
        log("typeof browser.log: " + typeof (browser as unknown as PerformancePlugin).log, LogLevel.DEBUG, typeof (browser as unknown as PerformancePlugin).log);
        // Check if there's a browser.log function we can call. If we can call it, if we can't or it fails, do a normal log
        if (browser && typeof (browser as unknown as PerformancePlugin).log === "function") {
          try {
            (browser as unknown as PerformancePlugin).log(message, TestErrorSeverity.ERROR);
          } catch (error: unknown) {
            log("Could not call browser.log", LogLevel.WARN, error);
          }
        }
        throw e;
      });
    })
  ).then((allSettled) => {
    // Find any rejected and throw the first error
    const errors = allSettled.filter((result) => result.status === "rejected").map((error) => error.reason);
    if (errors.length > 0) { throw errors[0]; }
  });
}

/**
 * Checks whether all the provided WebdriverIO `elector(s) is displayed on the page. If they do not,
 * it logs them as test errors on the page and rethrows. Uses `<WebdriverElement>.waitForDisplayed()`
 * @param selectors Array of WebdriverIO selectors to check if they are displayed on the page
 */
export async function assertElementsDisplayed (...selectors: Selector[]) {
  const puppeteerPage = await getPuppeteerPage();
  const isLighthouse: boolean = (browser && typeof (browser as unknown as PerformancePlugin).getGlobalTags === "function")
    && (await (browser as unknown as PerformancePlugin).getGlobalTags()).plugin === "lighthouse";
  // puppeteer waitForSelector fails with 1ms, 10ms seems to be long enough default
  const timeout = helperDefaults.assertTimeout + (isLighthouse ? 10 : 0);
  log("assertElementsExist isLighthouse: " + isLighthouse, LogLevel.WARN, { timeout, selectors });
  // All settled to log all failures
  await Promise.allSettled(
    selectors.map((selector) => {
      log("assertElementsExist selector: " + selector, LogLevel.WARN, { isLighthouse, typeofSelector: typeof selector, selector });
      return (isLighthouse && typeof selector === "string" && !selector.includes("*=")
        ? (selector.startsWith("//")
          ? puppeteerPage.waitForSelector(`::-p-xpath(${selector})`, { timeout, visible: true })
          : puppeteerPage.waitForSelector(selector, { timeout, visible: true })
        )
        : browser.$(selector).waitForDisplayed({ timeout })
      ).then((value) => {
        log("assertElementsExist success selector: " + selector, LogLevel.WARN, { isLighthouse, value });
        return value;
      }).catch((e: unknown) => {
        const message = e instanceof Error ? e.message : `${e}`;
        log(message, LogLevel.WARN, e);
        log("typeof browser.log: " + typeof (browser as unknown as PerformancePlugin).log, LogLevel.DEBUG, typeof (browser as unknown as PerformancePlugin).log);
        // Check if there's a browser.log function we can call. If we can call it, if we can't or it fails, do a normal log
        if (browser && typeof (browser as unknown as PerformancePlugin).log === "function") {
          try {
            (browser as unknown as PerformancePlugin).log(message, TestErrorSeverity.ERROR);
          } catch (error: unknown) {
            log("Could not call browser.log", LogLevel.WARN, error);
          }
        }
        throw e;
      });
    })
  ).then((allSettled) => {
    // Find any rejected and throw the first error
    const errors = allSettled.filter((result) => result.status === "rejected").map((error) => error.reason);
    if (errors.length > 0) { throw errors[0]; }
  });
}

/**
 * Checks whether all the provided WebdriverIO `elector(s) exist and are clickable on the page. If they do not,
 * it logs them as test errors on the page and rethrows. Uses `<WebdriverElement>.waitForClickable()`
 * @param selectors Array of WebdriverIO selectors to check if they exist and are clickable on the page
 */
export async function assertElementsClickable (...selectors: Selector[]) {
  // All settled to log all failures
  await Promise.allSettled(
    selectors.map((selector) =>
      browser.$(selector).waitForClickable({ timeout: helperDefaults.assertClickableTimeout }).catch((e: unknown) => {
        const message = e instanceof Error ? e.message : `${e}`;
        log(message, LogLevel.WARN, e);
        log("typeof browser.log: " + typeof (browser as unknown as PerformancePlugin).log, LogLevel.DEBUG, typeof (browser as unknown as PerformancePlugin).log);
        // Check if there's a browser.log function we can call. If we can call it, if we can't or it fails, do a normal log
        if (browser && typeof (browser as unknown as PerformancePlugin).log === "function") {
          try {
            (browser as unknown as PerformancePlugin).log(message, TestErrorSeverity.ERROR);
          } catch (error: unknown) {
            log("Could not call browser.log", LogLevel.WARN, error);
          }
        }
        throw e;
      })
    )
  ).then((allSettled) => {
    // Find any rejected and throw the first error
    const errors = allSettled.filter((result) => result.status === "rejected").map((error) => error.reason);
    if (errors.length > 0) { throw errors[0]; }
  });
}

/**
 * Helper function to set cookies in the browser.
 * @param cookies List of cookies to set in the browser.
 */
export async function setCookies (...cookies: Omit<CDP.Network.CookieParam, "partitionKey">[]): Promise<void> {
  if (!Array.isArray(cookies) || cookies.length === 0) {
    return;
  }
  // const cdp = await getHelperCdpClient();
  // return await cdp.send("Network.setCookies", { cookies });
  const puppeteerCookies: PuppeteerCookie[] = cookies.map((cookie) => ({
    session: false,
    size: 0,
    ...cookie
  } as PuppeteerCookie));
  try {
    const puppeteerBrowser = await browser.getPuppeteer();
    return await (puppeteerBrowser as any).setCookie(...puppeteerCookies);
  } catch (error) {
    // Depending on your version of Puppeteeer and WebdriverIO the legacy may be broken, or the new way might
    log("browser.setCookies failed. Using page fallback", LogLevel.WARN, error);
    const page = await getPuppeteerPage();
    // return await browser.cdp("Network", "setCookies", { cookies });
    return await page.setCookie(...puppeteerCookies);
  }
}

/**
 * Helper function to access cookies on the page or other pages. If no URLs are specified,
 * this method returns cookies for the current page URL. If URLs are specified,
 * only cookies for those URLs are returned.
 * @param urls Optional list of urls
 * @returns Cookies for the current page or specified pages.
 */

export async function getCookies (...urls: string[]): Promise<CDP.Network.Cookie[]> {
  // const cdp = await getHelperCdpClient();
  // const { cookies }: CDP.Network.GetCookiesResponse = await cdp.send("Network.getCookies", { urls });
  try {
    const puppeteerBrowser = await browser.getPuppeteer();
    const cookies: CDP.Network.Cookie[] = await (puppeteerBrowser as any).cookies() as CDP.Network.Cookie[];
    return cookies;
  } catch (error) {
    // Depending on your version of Puppeteeer and WebdriverIO the legacy may be broken, or the new way might
    log("browser.getCookies failed. Using page fallback", LogLevel.WARN, error);
    const page = await getPuppeteerPage();
    const cookies: CDP.Network.Cookie[] = await page.cookies(...urls) as CDP.Network.Cookie[];
    return cookies;
  }
}

export function waitForComplete ({ timeout, ...options }: Partial<WaitUntilOptions> = {}) {
  return browser.waitUntil(
    () => browser.execute(() => document.readyState === "complete"), {
      timeout: timeout || DEFAULT_WAIT_TIMEOUT,
      ...options
    }
  );
}

/**
 * Attempts to clear the local storage, browser cache, and browser cookies. Use `setSession()` afterwards.
 * Alternatively use `browser.reloadSession()`. https://webdriver.io/docs/api/browser/reloadSession/
 */
export async function clearCache (): Promise<void> {
  const client = await getHelperCdpClient();
  await Promise.all([
    browser.execute("window.localStorage.clear()"),
    // CDP - tot - unstable
    client.send("HeapProfiler.collectGarbage"),
    client.send("Network.clearBrowserCache"),
    client.send("Network.clearBrowserCookies"),
    client.send("Runtime.evaluate", {
      expression: "chrome.benchmarking.closeConnections(); chrome.benchmarking.clearHostResolverCache()"
    })
  ]);
}

/**
 * Helper function to enter text into a locator. Uses `browser.keys()` to enter each character.
 * @param selector Selector to insert text
 * @param text string to type/add
 */
/** @deprecated */
export async function browserType (selector: Selector, text: string): Promise<void>;
export async function browserType (text: string): Promise<void>;
export async function browserType (arg1: Selector | string, arg2?: string) {
  let text;
  if (arg2) {
    text = arg2;
    await browser.$(arg1).click();
  } else {
    text = arg1 as string;
  }
  await Promise.all([...text].map((char) => browser.keys(char)));
}

/**
 * Modifies all requests to add additional headers to the outgoing requests. Cannot be used with `changeResourceDomain()`
 * @param additionalHeaders {AdditionalHeaders} The additional Headers to add
 * @returns {void}
 */
export async function addAdditionalHeaders (additionalHeaders: AdditionalHeaders): Promise<void> {
  if (helperDefaults.customHeaders === undefined) {
    const client = await getHelperCdpClient();
    let listenerCount = client.listenerCount("Fetch.requestPaused");
    log("addAdditionalHeaders listener count before: " + listenerCount, LogLevel.DEBUG, { listenerCount, additionalHeaders });

    // Add the handler
    client.on("Fetch.requestPaused", (event: CDP.Fetch.RequestPausedEvent) => {
      // We sometimes get multiple paused events. The second one then errors on the "continueRequest"
      log("Fetch.requestPaused", LogLevel.DEBUG, { event });

      let headers: CDP.Fetch.HeaderEntry[] | undefined;
      if (helperDefaults.customHeaders && helperDefaults.customHeaders.length > 0) {
        // Include the original headers and the new ones, last ones take precedence
        const originalHeaders: CDP.Fetch.HeaderEntry[] = Object.entries(event.request.headers)
          .map(([name, value]) => ({ name, value }));
        headers = [...originalHeaders, ...(helperDefaults.customHeaders || [])];
        log("adding custom headers", LogLevel.DEBUG, { customHeaders: helperDefaults.customHeaders });
      }
      client.send("Fetch.continueRequest", { requestId: event.requestId, headers })
      .then (() => log("Fetch.continueRequest", LogLevel.DEBUG, { headers, event }))
      .catch ((error) => log("Error calling CDP.Fetch.continueRequest on: " + JSON.stringify(event), LogLevel.WARN, error));
    });
    const urlPattern = additionalHeaders.urlPattern || undefined; // Change empty string back to undefined
    await client.send("Fetch.enable", { patterns: [{ requestStage: "Request", urlPattern }] });
    listenerCount = client.listenerCount("Fetch.requestPaused");
    log("addAdditionalHeaders listener count after: " + listenerCount, LogLevel.DEBUG, { listenerCount, additionalHeaders });
  }
  // Save these so we know they're on. They have to be saved to the browser, not a global var
  log("setting custom headers", LogLevel.DEBUG, { old: helperDefaults.customHeaders || "undefined", new: additionalHeaders.headers });
  helperDefaults.customHeaders = additionalHeaders.headers;
}

/**
 * Removes all requests to add additional headers to the outgoing requests.
 * @returns {void}
 */
export async function resetAdditionalHeaders (): Promise<void> {
  if (helperDefaults.customHeaders !== undefined) {
    const client = await getHelperCdpClient();
    let listenerCount = client.listenerCount("Fetch.requestPaused");
    log("resetAdditionalHeaders listener count before: " + listenerCount, LogLevel.DEBUG, { listenerCount, additionalHeaders: helperDefaults.customHeaders });

    // Remove the handler
    client.removeAllListeners("Fetch.requestPaused");
    helperDefaults.customHeaders = undefined;
    listenerCount = client.listenerCount("Fetch.requestPaused");
    log("resetAdditionalHeaders listener count after: " + listenerCount, LogLevel.DEBUG, { listenerCount, additionalHeaders: helperDefaults.customHeaders || "undefined" });
  }
}

/**
 * Creates a second "Reload" test of this function which will run after the existing test
 * @param test A Mocha.Test to add as a "Reload" test
 * @param suite Mocha.Suite to add the new test to
 */
export function reloadIt (test: MochaTest, suite: MochaSuite) {
  // suite.addTest(new MochaTest(" Reload", test.fn));
  suite.addTest(new MochaTest(test.title + " Reload", test.fn));
}

export type SetUserAgentOverrideRequest = Partial<CDP.Network.SetUserAgentOverrideRequest> & {
  /** String to insert into the default User-Agent. Ignored if 'userAgent; is passed */
  insertString?: string;
  /** Modify the User-Agent to a mobile browser. Ignored if 'userAgent' is passed */
};
/**
 * Overrides the Browser UserAgent. Either pass in a completely new 'userAgent'
 * parameter or an 'insertString' to insert into the User-Agent but not both.
 * @param {Partial<CDP.Network.SetUserAgentOverrideRequest>} SetUserAgentOverrideRequest & insertString & mobileType
 */
export async function setUserAgentOverride ({ insertString, ...overrideRequest }: SetUserAgentOverrideRequest): Promise<string | undefined> {
  log("setUserAgentOverride", LogLevel.DEBUG, { insertString, ...overrideRequest });
  if ((typeof insertString === "undefined" || insertString === "")
    && (typeof overrideRequest.userAgent === "undefined" || overrideRequest.userAgent === "")) {
    const errorMessage = "Either 'insertString' or 'userAgent' should be passed";
    log(errorMessage, LogLevel.WARN, { insertString, ...overrideRequest });
    return undefined;
  }
  if (insertString && overrideRequest.userAgent) {
    log("Both 'insertString' and 'userAgent' passed, ignoring 'userAgent'", LogLevel.WARN, { insertString, ...overrideRequest });
  }
  try {
    const client = await getHelperCdpClient();
    if (insertString) {
      // https://github.com/webdriverio/webdriverio/issues/9079 getVersion only returns the original, not modified one
      const version: CDP.Browser.GetVersionResponse = await client.send("Browser.getVersion");
      log("Browser.getVersion()", LogLevel.DEBUG, version);
      let userAgent: string;
      userAgent = version.userAgent.replace(/\) AppleWebKit/, `; ${insertString}) AppleWebKit`);
      log(`Setting User-Agent [${userAgent}]`, LogLevel.DEBUG);
      if (!userAgent || !userAgent.includes(insertString)) {
        const message: string = `userAgent was not modified to include '${insertString}' from '${userAgent}'`;
        log(message, LogLevel.ERROR, { insertString, userAgent, version });
        userAgent = insertString; // We'll just force it
      }
      overrideRequest.userAgent = userAgent;
    }
    log("Network setUserAgentOverride", LogLevel.INFO, { insertString, overrideRequest });
    await client.send("Network.setUserAgentOverride", { ...overrideRequest, userAgent: overrideRequest.userAgent! });
    await client.send("Emulation.setUserAgentOverride", { ...overrideRequest, userAgent: overrideRequest.userAgent!});
    return overrideRequest.userAgent;
  } catch (error: unknown) {
    log(`Could not set User-Agent: ${error}`, LogLevel.ERROR, error, { insertString, ...overrideRequest });
    throw error;
  }
}
