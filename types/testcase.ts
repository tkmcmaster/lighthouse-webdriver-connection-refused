import { WindowSize } from "./lhparams";

export enum Environment {
  Prod = "prod",
  Beta = "beta",
  Integration = "integration"
}

export enum SessionType {
  /** No session provided, not logged in */
  Unauthenticated = "unauthenticated",
  /** Default test user session */
  Authenticated = "authenticated",
  /** Special user session for logins */
  Facebook = "facebook",
  /** Special user session for logins */
  Google = "google",
  /** Must specify a username in the TestCase that uses the default test password */
  Custom = "custom"
}

export interface Credentials {
  username: string;
  password: string;
}

// https://www.typescriptlang.org/docs/handbook/enums.html#computed-and-constant-members `FileAccess`
// https://basarat.gitbook.io/typescript/type-system/enums#number-enums-as-flags
export enum TestOptions {
  /** Runs the default non-throttled, as well as all default simLocations */
  DEFAULT,
  /** Runs the default non-throttled only */
  // eslint-disable-next-line no-bitwise
  SKIP_INTERNATIONAL = 1 << 0,
  /** Runs the default simLocations only, skipping non-throttled */
  // eslint-disable-next-line no-bitwise
  SKIP_NOT_INTERNATIONAL = 1 << 1,
  /** Skips all default throttled and not throttled. Only will run specified simLocations */
  // eslint-disable-next-line no-bitwise
  SKIP_ALL = SKIP_INTERNATIONAL | SKIP_NOT_INTERNATIONAL,
  /** @deprecated Skips the WebdriverIO Tests regardless */
  // eslint-disable-next-line no-bitwise
  SKIP_WEBDRIVERIO = 1 << 2,
  /** Skips the WebdriverIO Tests regardless */
  // eslint-disable-next-line no-bitwise
  SKIP_PAGESTATS = 1 << 2,
  /** Skips the Lighthouse Tests regardless */
  // eslint-disable-next-line no-bitwise
  SKIP_LIGHTHOUSE = 1 << 3,
}

/** Test Case definition stored in s3 (What the controller needs) */
export interface TestCase {
  /** The name of this test. Must be unique to the environment since this will be used to aggregate data in Splunk */
  name: string;
  /** Type of sessionId the page needs to load */
  sessionType: SessionType;
  /** Custom username to use for the test case. Only used (and require) if SessionType.Custom. Must have the default test password */
  username?: string;
  /** The environments this test will be queued to run against */
  environments: Environment[];
  /** If the test needs the actual username and password (or helper name and pin) */
  needCredentials?: SessionType; // The test saved on disk will store this
  /** Default reload page, true will not run reload */
  noReload?: boolean;
  /** Skips the default set of international simLocations and/or non-throttled */
  testOptions?: TestOptions;
  /** proxy to enable in Chrome */
  proxy?: string;
  /** Override the normal frequency and run every X minutes */
  runEveryMin?: number;
  /** Frequency for the simLocations if provided. Ignored if simLocations is undefined */
  runEveryMinSimLocations?: number;
  /** By default, tests are run on headless Chrome, unless this is set to true. */
  noHeadless?: boolean;
}

/** The configuration that will be run with this test (What the test needs from the SQS queue) */
export interface TestConfiguration {
  /** This is the contents of the test.ts code so we can require/import the entire contents (including helper functions) */
  testTsCode: string;
  /** The environment this test will actually be run against */
  environment: string;
}

/** Configuration options for plugins. The environment will be optional, and there will NOT be the testTsCode */
export interface PluginConfiguration {
  /** Where the results are written. */
  resultsDirectory?: string;
  /** Set the size of the Chrome Window */
  windowSize?: WindowSize;
  /** String to inject into the default user agent */
  userAgent?: string | boolean;
}

/** Data sent on the test queue */
export interface TestRun extends TestCase {
  configuration: TestConfiguration;
  /** Whether to upload the results. If application is set/is in aws, this will be true regardless */
  upload?: boolean;
}

// BUG: Not used?
export interface SetSessionOptions {
  alias?: string;
  helperAlias?: string;
  invalidateSession?: true;
  throwAway?: true;
}
