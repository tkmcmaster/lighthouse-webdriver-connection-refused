// import type { IncomingHttpHeaders, OutgoingHttpHeaders } from "http";
import type CDP from "devtools-protocol";
import type { ClickOptions } from "webdriverio";

export enum TestErrorSeverity {
  ERROR = "ERROR",
  WARN = "WARN",
  INFO = "INFO",
  DEBUG = "DEBUG"
}

export type Tags = Record<string, unknown>;

/** Interface to help autocomplete on function calls like perfUrl */
export interface TagHelper extends Tags {
  name?: string;
  environment?: string;
  reload?: boolean | null;
  requestIgnorelist?: string[];
  domIgnorelist?: string;
  plugin?: "pagestats" | "lighthouse";
}

/** Any additional options will be treated as tags. Can be `requestIgnorelist` */
export interface BrowserUrlOptions extends TagHelper {
  /** waitFor event. Can be any of the `currentPage.metrics` though usually `fullyLoaded` is recommended */
  waitFor?: string;
  /** Override the default timeout (in ms) for all resources to be completed (currently 2 minutes as 120000 ms) */
  timeout?: number;
}

export interface ResultsFileNameParams {
  testId: string;
  pageTs: string | number;
  environment: string;
  extension?: string;
}

/**
 * Defaults for the Peformance Plugins
 */
export interface PluginDefaults {
  /** Default when using browser.waitFor() (in ms). Defaults to the environment variable {DEFAULT_WAIT_TIMEOUT} or 120000 */
  waitTimeout: number;
  /** Default time the plugin will wait for visually complete (in seconds) after fully loaded.
   *  Defaults to the environment variable {DEFAULT_VISUALLY_COMPLETE_INTERVAL} or 1.9 */
  visuallyCompleteInterval: number;
  /** Default time the plugin will wait with no network traffic (in ms) for fully loaded. Defaults to the environment variable {DEFAULT_FULLY_LOADED_INTERVAL} or 2000 */
  fullyLoadedInterval: number;
}

export interface SummaryUsageStat {
  total: number;
  unused: number;
}

export interface BrowserTags extends Tags {
  testId: string;
  reload?: boolean | null;
  sessionId?: string;
  requestIgnorelist?: string[];
  navigateIgnorelist?: string[];
}
export type Metrics = Record<string, number | undefined>;
export interface ResourceMetrics extends Metrics {
  brcv: number;
  size: number;
  windowCount: number;
  [key: string]: number | undefined;
}
export type SummaryUsageCollection = Record<string, SummaryUsageStat>;

export interface CallFrame {
  function?: string;
  url: string;
  line: number;
  column: number;
}

export interface ConsoleMessage {
  level: CDP.Log.LogEntry["level"] | "log" | "debug";
  source: CDP.Log.LogEntry["source"] | "console";
  stackTrace?: CallFrame[];
  text: string;
  timestamp: number;
}

// export interface ResourceTags extends Tags {
//   method: string;
//   url: string;
//   frameId?: string;
//   initiator: CDP.Network.Initiator;
//   mime?: string;
//   status?: number;
//   protocol?: string;
//   fromDiskCache?: boolean;
//   connectionId?: number;
//   inHeaders?: IncomingHttpHeaders; // CDP.Network.Headers;
//   outHeaders?: OutgoingHttpHeaders; // CDP.Network.Headers;
//   dataStartTs: number;
//   dataEndTs: number;
//   finished?: boolean;
//   diskCache?: boolean;
//   servedFromCache?: boolean;
//   failed?: boolean;
//   // Needed for the Har generation
//   postData?: string;
//   initialPriority?: string;
//   timestamp?: number;
//   statusText?: string;
//   remoteIPAddress?: string;
//   remotePort?: number;
//   canceled?: boolean;
//   errorText?: string;
//   blockedReason?: string;
//   corsErrorStatus?: string | CDP.Network.CorsErrorStatus
// }

// export interface Resource {
//   ts: number;
//   tags: ResourceTags;
//   metrics: ResourceMetrics;
//   timing?: CDP.Network.ResourceTiming;
// }

export interface StackTrace {
  url: string;
  column: number;
  line: number;
  function?: string;
}

// export interface PageTags extends Tags {
//   testId: string;
//   testAgent?: string;
//   environment?: string;
//   chromeVersion?: string;
//   simLocation?: string;
//   url?: string;
//   consoleMessages?: ConsoleMessage[];
//   screenshot?: string;
//   name?: string;
//   title?: string;
//   parent?: string;
//   reload?: boolean | null;
//   frameTimings?: number[];
//   video?: string;
//   testInfo?: string[];
//   testWarn?: string[];
//   testError?: string[];
//   sessionId?: string;
//   requestIgnorelist?: string[];
//   domIgnorelist?: string;
// }

// export interface Page {
//   metrics: Metrics;
//   jsCoverageSummary: SummaryUsageCollection;
//   cssCoverageSummary: SummaryUsageCollection;
//   resources: Resource[];
//   tags: PageTags;
//   ts: number;
// }

export interface PerformancePlugin {
  // All addCommand functions must be async/await
  // https://webdriver.io/docs/customcommands/#extend-type-definitions
  /**
   * Overrides the default timeouts or customHeaders used by the plugin
   * @param pluginDefaults New default values.
   */
  overridePluginDefaults (pluginDefaults: Partial<PluginDefaults>): Promise<void>;
  /**
   * Sets the default global tags to be used on future pages
   * @param tags Tags to set.
   */
  setGlobalTags (tags: TagHelper): Promise<void>;
  /** Retrieves the current Global tags used on every new page */
  getGlobalTags (): Promise<TagHelper>;
  /**
   * Sets the tags for the current page
   * @param tags Tags to set
   */
  setPageTags (tags: TagHelper): Promise<void>;
  /** Retrieves the current page tags for the current page */
  getPageTags (): Promise<TagHelper>;
  /**
   * Logs a message to the page object
   * @param message
   * @param severity
   */
  log (message: string, severity?: TestErrorSeverity): Promise<void>;
  setReload (reload: boolean | null | undefined): Promise<void>;
  getReload (): Promise<boolean | null | undefined>;

  /**
   * Override for `browser.url()` to add additional name or tagging options.
   * @param url
   * @param options Optional page name or other tags for the page navigated.
   */
  perfUrl (url: string, options?: BrowserUrlOptions): Promise<void>;
  /** @deprecated Never used */
  waitFor (event: string, timeout?: number): Promise<void>;
  /**
   * Navigates to the page only if reload is false. No-op otherwise
   * @param url
   * @param tags Optional tags for this page
   */
  preload (url: string, tags?: TagHelper): Promise<void>;
}

export interface ClickOptionsPage extends Partial<ClickOptions>, TagHelper {
  /** Name for the new page that is unique to this page */
  pageName: string;
  /** waitFor event. Can be any of the `currentPage.metrics` though usually `fullyLoaded` is recommended */
  waitFor?: string;
  /** Override the default timeout (in ms) for all resources to be completed (currently 2 minutes as 120000 ms) */
  timeout?: number;
  timerName?: undefined; // Type check if someone adds the wrong one don't accept strings
}

export interface ClickOptionsTimer extends Partial<ClickOptions> {
  /** Name for the page timer that is unique to this page */
  timerName?: string;
  pageName?: undefined; // Type check if someone adds the wrong one don't accept strings
}

export interface PerformanceElement {
  // All addCommand functions must be async/await
  // https://webdriver.io/docs/customcommands/#extend-type-definitions
  click (options?: ClickOptionsPage | ClickOptionsTimer | undefined): Promise<void>;
  clickTimer (options?: ClickOptionsPage | ClickOptionsTimer | undefined): Promise<void>;
}
