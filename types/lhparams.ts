// import type { ResultsFileNameParams, Tags, WindowSize } from "@fs/active-monitoring-wdiohelper";
import type { FlowResult } from "lighthouse";

export enum FormFactor {
  PHONE = "mobile",
  DESKTOP = "desktop"
}
export type WindowSize = Record<"width" | "height", number>;

export type LightHouseScreenEmulation = WindowSize & {
  name: string;
  mobile: boolean;
  deviceScaleFactor: number;
  disabled: boolean;
}

export interface LightHouseScreenThrottling {
  name: string;
  rttMs: number;
  throughputKbps: number;
  requestLatencyMs: number;
  downloadThroughputKbps: number;
  uploadThroughputKbps: number;
  cpuSlowdownMultiplier: number;
}

export interface LighthouseLaunchOptions extends Record<string, unknown> {
  /** Lighthouse client options (mobile or desktop) */
  formFactor: FormFactor;
  /** Lighthouse emulation settings */
  throttling: LightHouseScreenThrottling;
  /** Window Size  */
  screenEmulation: LightHouseScreenEmulation;
  /** Override the default user agent */
  emulatedUserAgent?: string | boolean;
  /** Timeout in ms to wait for page to finish loading */
  timeout?: number;
}

export interface PageTags extends LighthouseLaunchOptions {
  environment: string;
  ts: number;
  testAgent?: string;
  simLocation?: string;
  url?: string;
  name?: string;
  title?: string;
  parent?: string;
  reload?: boolean | null;
  testInfo?: string[];
  testWarn?: string[];
  testError?: string[];
  sessionId?: string;
  formFactor: FormFactor,
  emulatedUserAgent?: string | boolean,
  throttling: LightHouseScreenThrottling,
  screenEmulation: LightHouseScreenEmulation,
}

// TODO: we should provide typings for these two results files.
export interface LightHouseResults {
  pageTags: PageTags;
  lighthouseComprehensiveResult?: string;
  lighthouseJSONResult?: FlowResult;
  // We need to save it off and validate in our integration tests
  splunkData?: SplunkLHR[];
}

export type WeightCounts = Record<number, number | undefined>;

export interface SplunkLHR {
  ts?: number;
  name?: string;
  wdioTestId?: string;
  testId: string;
  suiteId?: string;
  url?: string;
  environment?: string;
  formFactor?: string;
  emulatedUserAgent?: string | boolean;
  throttling?: LightHouseScreenThrottling;
  simLocation?: string | null;
  screenEmulation?: LightHouseScreenEmulation;
  reload?: boolean | null;
  runWarnings: number;
  [key: `runWarning_${number}`]: string | undefined | null;
  performanceScore: number | null | undefined;
  firstContentfulPaintScore: number | null | undefined;
  speedIndexScore: number | null | undefined;
  largestContentfulPaintScore: number | null | undefined;
  timeToInteractiveScore: number | null | undefined;
  totalBlockingTimeScore: number | null | undefined;
  cumulativeLayoutShiftScore: number | null | undefined;
  accessibility: number | null | undefined;
  bestPractices: number | null | undefined;
  seo: number | null | undefined;
  performanceWeights?: WeightCounts;
  accessibilityWeights?: WeightCounts;
  bestpracticesWeights?: WeightCounts;
  seoWeights?: WeightCounts;
  title?: string;
  parent?: string;
  sessionId?: string;
  testError?: string[];
  testWarn?: string[];
  testInfo?: string[];
  testDebug?: string[];
}
