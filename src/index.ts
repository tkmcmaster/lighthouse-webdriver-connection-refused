import * as lighthousewdio from "./lighthousewdio";
import * as logger from "./log";
import * as service from "./service";
import LightHouseWDIODefaultInstance, { LightHouseWDIO } from "./lighthousewdio";
import { LightHouseWDIOService, LightHouseWDIOServiceOptions } from "./service";

export * from "../types";
export default LightHouseWDIOService;

export type {
  LightHouseWDIOServiceOptions
};

export {
  lighthousewdio,
  logger,
  service,
  LightHouseWDIO,
  LightHouseWDIODefaultInstance
};
