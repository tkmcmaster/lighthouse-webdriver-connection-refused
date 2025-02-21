/**
 * @license Copyright 2018 The Lighthouse Authors. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 *
 * Comes from lighthouse module https://github.com/GoogleChrome/lighthouse/blob/master/core/config/constants.js
 */

import type { LightHouseScreenEmulation, LightHouseScreenThrottling, WindowSize } from "./lhparams";
// We can't import type so grab it from the /lib/types to avoid pulling in more than we need
export const windowSizeDesktop: WindowSize = { width: 1920, height: 1080 };
export const windowSizePhone: WindowSize = { width: 480, height: 800 };
export const windowSizeTablet: WindowSize = { width: 1280, height: 800 };
 export const DEVTOOLS_RTT_ADJUSTMENT_FACTOR = 3.75;
 export const DEVTOOLS_THROUGHPUT_ADJUSTMENT_FACTOR = 0.9;

 export const MOBILE_REGULAR_3G: LightHouseScreenThrottling = {
   name: "MOBILE_REGULAR_3G",
   rttMs: 300,
   throughputKbps: 700,
   requestLatencyMs: 300 * DEVTOOLS_RTT_ADJUSTMENT_FACTOR,
   downloadThroughputKbps: 700 * DEVTOOLS_THROUGHPUT_ADJUSTMENT_FACTOR,
   uploadThroughputKbps: 700 * DEVTOOLS_THROUGHPUT_ADJUSTMENT_FACTOR,
   cpuSlowdownMultiplier: 4
 };

 export const MOBILE_SLOW_4G: LightHouseScreenThrottling =  {
   name: "MOBILE_SLOW_4G",
   rttMs: 150,
   throughputKbps: 1.6 * 1024,
   requestLatencyMs: 150 * DEVTOOLS_RTT_ADJUSTMENT_FACTOR,
   downloadThroughputKbps: 1.6 * 1024 * DEVTOOLS_THROUGHPUT_ADJUSTMENT_FACTOR,
   uploadThroughputKbps: 750 * DEVTOOLS_THROUGHPUT_ADJUSTMENT_FACTOR,
   cpuSlowdownMultiplier: 4
 };

 export const DESKTOP_DENSE_4G: LightHouseScreenThrottling =  {
   name: "DESKTOP_DENSE_4G",
   rttMs: 40,
   throughputKbps: 10 * 1024,
   cpuSlowdownMultiplier: 1,
   requestLatencyMs: 0,
   downloadThroughputKbps: 0,
   uploadThroughputKbps: 0
 };

 export const DESKTOP_NO_THROTTLING: LightHouseScreenThrottling =  {
  name: "DESKTOP_NO_THROTTLING",
  rttMs: 0,
  throughputKbps: 0, // 1 * 1024 * 1024,
  cpuSlowdownMultiplier: 1,
  requestLatencyMs: 0,
  downloadThroughputKbps: 0,
  uploadThroughputKbps: 0
};

export const MOBILE_EMULATION_METRICS: LightHouseScreenEmulation = {
  ...windowSizePhone,
  name: "MOBILE_EMULATION_METRICS",
  mobile: true,
  // Moto G4 is really 3, but a higher value here works against
  // our perf recommendations.
  // https://github.com/GoogleChrome/lighthouse/issues/10741#issuecomment-626903508
  deviceScaleFactor: 2.625,
  disabled: false
};

export const DESKTOP_EMULATION_METRICS: LightHouseScreenEmulation = {
  ...windowSizeDesktop,
  name: "DESKTOP_EMULATION_METRICS",
  mobile: false,
  deviceScaleFactor: 1,
  disabled: false
};

export const SCREEN_EMULATION_SETTINGS = {
  mobile: MOBILE_EMULATION_METRICS,
  desktop: DESKTOP_EMULATION_METRICS
};

export const THROTTLING_EMULATION_SETTINGS = {
  MOBILE_REGULAR_3G,
  MOBILE_SLOW_4G,
  DESKTOP_DENSE_4G,
  DESKTOP_NO_THROTTLING
};