import { WindowSize } from "./lhparams";

/** Configuration options for plugins. The environment will be optional, and there will NOT be the testTsCode */
export interface PluginConfiguration {
  /** Where the results are written. */
  resultsDirectory?: string;
  /** Set the size of the Chrome Window */
  windowSize?: WindowSize;
}

export type Tags = Record<string, unknown>;


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
