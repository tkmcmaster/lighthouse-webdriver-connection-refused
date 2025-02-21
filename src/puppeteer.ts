import type { CDPSession, Page } from "puppeteer-core";
import { LogLevel, log } from "./log";

// Export for testing
export const HELPER_CDP_CLIENT = "_helperCdp";

/**
 * Helper function for accessing the Puppeteer instance for the default/first tab
 * @returns A puppeteer instance for the default tab
 */
export async function getPuppeteerPage (): Promise<Page> {
  const puppeteer = await browser.getPuppeteer();
  const pages = await puppeteer.pages();
  log("getPuppeteerPage count: " + pages.length, LogLevel.DEBUG, await Promise.all(pages.map(async (page) => ({ title: await page.title(), url: page.url() }))));
  // Starting in WebdriverIO v9, there will be 2 pages. We want the non-BiDi one
  // array.filter doesn't let you do async/await and we need to check the title
  const [page] = [...pages.filter((puppeeterPage) => !puppeeterPage.url().startsWith("data:")), ...pages];
  log("getPuppeteerPage page: " + page.url(), LogLevel.DEBUG, { title: await page.title(), url: page.url() });
  if (!page) {
    throw new Error("Could not load the puppeeter page");
  }
  return page as unknown as Page;
}

/**
 * Creates a CDPSession for the first tab/page. Returns the existing one if it already exists
 * @returns A Chrome Developer Protocol session (CDPSession)
 */
export async function getHelperCdpClient (): Promise<CDPSession> {
  const page = await getPuppeteerPage();
  // Create a shared one for the page. Don't create a new one on each call
  if ((page as any)[HELPER_CDP_CLIENT] === undefined) {
    const cdpSession = (page as any)[HELPER_CDP_CLIENT] = await page.createCDPSession();
    await cdpSession.send("Network.enable");
    log("Created createCDPSession for browser", LogLevel.DEBUG, { sessionId: browser.sessionId, cdpId: cdpSession.id() });
  } else {
    log("Using existing CDPSession for browser", LogLevel.TRACE, { sessionId: browser.sessionId, cdpId: (page as any)[HELPER_CDP_CLIENT]?.id() });
  }
  return (page as any)[HELPER_CDP_CLIENT];
}
