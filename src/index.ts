import * as lib from "./lib";
import * as lighthousewdio from "./lighthousewdio";
import * as logger from "./log";
import * as service from "./service";
// import {
//   ClickOptionsPage,
//   ClickOptionsTimer,
//   PerformanceElement,
//   PerformancePlugin,
//   PluginConfiguration
// } from "../types";
import LightHouseWDIODefaultInstance, { LightHouseWDIO } from "./lighthousewdio";
import { LightHouseWDIOService, LightHouseWDIOServiceOptions } from "./service";

export * from "../types";
export default LightHouseWDIOService;

export type {
  LightHouseWDIOServiceOptions
};

export {
  lib,
  lighthousewdio,
  logger,
  service,
  LightHouseWDIO,
  LightHouseWDIODefaultInstance
};

// // https://webdriver.io/docs/typescript/#adding-custom-commands
// declare global {
//   // eslint-disable-next-line @typescript-eslint/no-namespace
//   namespace WebdriverIO {
//     // eslint-disable-next-line @typescript-eslint/no-empty-object-type
//     interface ServiceOption extends PluginConfiguration {}
//     // eslint-disable-next-line @typescript-eslint/no-empty-object-type
//     interface Browser extends PerformancePlugin { }
//     // eslint-disable-next-line @typescript-eslint/no-empty-object-type
//     interface MultiRemoteBrowser extends PerformancePlugin { }
//     interface Element extends PerformanceElement {
//       // https://github.com/microsoft/TypeScript/issues/4278#issuecomment-130273545
//       // MUST be redeclared to resolve incompatible types.
//       click (options?: ClickOptionsPage | ClickOptionsTimer | undefined): Promise<void>;
//     }
//   }
// }
