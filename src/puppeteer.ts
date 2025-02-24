import type { Page } from "puppeteer-core";

/**
 * Helper function for accessing the Puppeteer instance for the default/first tab
 * @returns A puppeteer instance for the default tab
 */
export async function getPuppeteerPage (): Promise<Page> {
  const puppeteer = await browser.getPuppeteer();
  const pages: Page[] = await puppeteer.pages();
  // Starting in WebdriverIO v9, there will be 2 pages. We want the non-BiDi one
  // array.filter doesn't let you do async/await and we need to check the title
  const [page] = [...pages.filter((puppeeterPage) => !puppeeterPage.url().startsWith("data:")), ...pages];
  if (!page) {
    throw new Error("Could not load the puppeeter page");
  }
  return page;
}
