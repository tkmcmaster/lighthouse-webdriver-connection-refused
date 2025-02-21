import * as _crypto from "crypto";
import * as _dns from "dns";
import * as _fs from "fs/promises";
import * as os from "os";
import type { Readable } from "stream";
import { createReadStream } from "fs";
import { mkdir } from "fs/promises";

// TODO: better regex solution, current regex allows name to be all digits, it shouldn't
export function isNameValid (name: string): boolean {
  return /^[\w:-]+$/g.test(`${name}`);
}

export async function createMainDirectory (mainDirName: string): Promise<void> {
  // Check to see if we have results directory, if we dont, create it
  await mkdir(mainDirName)
  .catch((error) => {
    if (error.code !== "EEXIST") {
      throw error;
    }
  });
}

export function getTimeStamp (): number {
  return Date.now() / 1000.0;
}

export const crypto = {
  hashStream (input: Readable | string, algorithm: string, encoding: _crypto.BinaryToTextEncoding = "hex") {
    return new Promise<string>((resolve, reject) => {
      const hash = _crypto.createHash(algorithm);
      if (typeof input == "string") {
        input = createReadStream(input);
      }
      input.on("data", (data) => {
        hash.update(data);
      }).on("end", () => {
        resolve(hash.digest(encoding));
      }).on("error", reject);
    });
  },
  hash (arg1: string | Buffer, algorithm: string, encoding: _crypto.BinaryToTextEncoding = "hex") {
    return _crypto.createHash(algorithm)
      .update(arg1 as string, "utf8")
      .digest(encoding);
  }
};

// substitute non-url-safe characters in base64 strings for url-safe
// alternatives and remove trailing equal signs.
// "/" is changed to "-" and "+" is changed to "_"
export function urlSafeBase64 (b64String: string) {
  return b64String.replace(/\//g, "-").replace(/\+/g, "_").replace(/=+$/g, "");
}

export function urlSafeBase64Hash (input: string | Buffer) {
  return urlSafeBase64(crypto.hash(input, "md5", "base64"));
}

const MAX_RECENT_COUNT: number = 30;
// Export for testing
export const recentDateTimes: number[] = [];
export function createTestId (dateTime: number = Date.now()) {
  // Check if this dateTime has been used (race condition)
  while (recentDateTimes.includes(dateTime)) {
    dateTime++;
  }
  // Add this one to recent and if we have more than MAX_RECENT_COUNT remove the oldest
  if (recentDateTimes.push(dateTime) >= MAX_RECENT_COUNT) { recentDateTimes.shift(); }
  return urlSafeBase64Hash(JSON.stringify(os.networkInterfaces()) + dateTime + process.pid);
}
