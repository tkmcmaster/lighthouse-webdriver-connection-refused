import type CDP from "devtools-protocol";

 // TODO: SESSION_ID is shortened for logging, FULL_SESSION_ID is the full one
/** If a sessionId is needed for the test it will be passed in as process.env[ENV_SESSION_ID] */
export const ENV_SESSION_ID = "SESSION_ID";
/** If a noReload is needed for the test it will be passed in as process.env[ENV_NO_RELOAD] */
export const ENV_ENVIRONMENT = "ENVIRONMENT";
export const ENV_TEST_ID = "TEST_ID";
export const ENV_SUITE_ID = "SUITE_ID";
export const ENV_NETWORK_PARAMETERS = "NETWORK_PARAMETERS";
export const ENV_VIDEO = "VIDEO";
export const ENV_MOBILE_TYPE = "MOBILE_TYPE";
export const ENV_USER_AGENT = "USER_AGENT";
export const ENV_GLOBAL_IGNORELIST = "GLOBAL_IGNORELIST";
export const ENV_NAVIGATE_IGNORELIST = "NAVIGATE_IGNORELIST";
export const ENV_SANITIZE_LIST = "SANITIZE_LIST";

export const ALL_ENVIRONMENT_VARIABLES = [
  ENV_ENVIRONMENT,
  ENV_MOBILE_TYPE,
  ENV_NETWORK_PARAMETERS,
  ENV_SESSION_ID,
  ENV_TEST_ID,
  ENV_SUITE_ID,
  ENV_USER_AGENT,
  ENV_VIDEO
];

export interface AdditionalHeaders {
  /** Optional url pattern to match additional headers. Defaults to "*" */
  urlPattern?: string;
  /** Array of Headers to add to requests. These are added to Chrome this.customHeaders for later modification */
  headers: CDP.Fetch.HeaderEntry[];
}

/**
 * Defaults for the Helper assert Functions
 */
export interface HelperDefaults {
  /** Default when using assertElementsExist() and assertElementsDisplayed() (in ms).
   *  Defaults to the environment variable {DEFAULT_ASSERT_TIMEOUT} or 1 */
  assertTimeout: number;
  /** Default when using assertElementsClickable() (in ms). Defaults to the environment variable {DEFAULT_CLICKABLE_TIMEOUT} or 1000 */
  assertClickableTimeout: number;
  /** Default headers calling addAdditionalHeaders(). Defaults to undefined. */
  customHeaders: CDP.Fetch.HeaderEntry[] | undefined;
}
