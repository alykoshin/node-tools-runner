import * as path from "path";
import * as fs from "fs/promises";

export const warn = (...args) => console.warn(`[WARN]`, ...args);
export const log = (...args) => console.log(`[LOG]`, ...args);
export const debug = (...args) => {
  // console.log(`[DEBUG]`, ...args);
}

export async function cleanup(dir: string) {
  try {
    if (!(await fs.stat(dir)).isDirectory()) {
      throw new Error('Not a directory')
    }
  } catch (e) {
    warn(`cleanup(): Directory "${dir}" does not exist or not a directory.`)
    return;
  }

  return fs.rm(dir, {recursive: true});
}

export async function mkdir(dir: string) {
  return await fs.mkdir(dir, {recursive: true});
}

export async function saveString(dir: string, filename: string, s: string, debugId?: string) {
  const outPathname = path.resolve(dir, filename);
  await mkdir(dir);
  await fs.writeFile(outPathname, s, {encoding: 'utf-8'})
  log((debugId ? `[${debugId}] ` : '') + `Saved ${s.length} characters to "${outPathname}"`);
}

export async function saveJson(dir: string, filename: string, json: any, debugId?: string) {
  const s = JSON.stringify(json, null, 2);
  return saveString(dir, filename, s, debugId)
}

export interface NodeErrors {
  meta: {
    description: string | string[]
  }
  data: ErrorDescription
}

// export interface _StringMap {
//   [code: string]: string
// }

export interface ErrorsGroup {
  description: string
  codes: {
    [code: string]: string
  }
}

export interface ErrorDescription {
  [code: string]: string
}

export function getWrapperForFile({data, url}: { data: ErrorsGroup, url: string }): NodeErrors {
  return {
    meta: {
      description: [
        `This file contains ${data.description}`,
        `automatically generated from following "${url}"`,
        `Do not edit it by hand.`,
      ]
    },
    data: data.codes,
  };
}


