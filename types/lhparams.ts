import type { FlowResult } from "lighthouse";

export enum FormFactor {
  PHONE = "mobile",
  DESKTOP = "desktop"
}
export type WindowSize = Record<"width" | "height", number>;

export interface LightHouseResults {
  lighthouseComprehensiveResult?: string;
  lighthouseJSONResult?: FlowResult;
}
