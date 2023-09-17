import * as fs from 'fs';
import * as fsPromises from 'fs/promises';

import {sanitizeArray} from '../sanitize';


export const writeTextFile = async (fname, text, encoding: BufferEncoding = 'utf8') => {
  process.stdout.write(`\n* Writing file ${fname}... `);
  await fsPromises.writeFile(fname, text, {encoding});
  process.stdout.write(`Done\n`);
  return await ensureFile(fname);
};


export const cleanup = async (title, filenames) => {
  filenames = sanitizeArray(filenames);
  if (filenames.length>0) process.stdout.write(`\n* ${title} `);
  filenames.forEach(fname => {
    fs.unlinkSync(fname);
    process.stdout.write(`${fname} `);
  });
  process.stdout.write(`Done.`);
  return await ensureNoFile(filenames);
};


export const iterateFiles = (filenames, title, fn) => {
  filenames = sanitizeArray(filenames);
  if (filenames.length>0) process.stdout.write(title);
  filenames.forEach(fname => {
    process.stdout.write(`"${fname}" `);
    fn(fname);
  });
};


export const fileCheckError = (fname: string, moreData?: any): void => {
  const msg = `Error checking file "${fname}"`;
  if (moreData) console.error(msg, moreData);
  else console.error(msg);
  throw new Error(msg);
};


export async function ensureFile(filenames: string|string[]) {
  if (!Array.isArray(filenames)) filenames = [filenames];
  iterateFiles(filenames, `* Checking files exist... `, fname => {
    const fd    = fs.openSync(fname, 'r');
    const stats = fs.fstatSync(fd);
    if (stats.isFile() && stats.size > 0) {
      console.log(`[${stats.size} bytes] `);
      return fname;
    } else {
      return fileCheckError(fname, stats);
    }
  });
}


export async function ensureNoFile(filenames: string|string[]) {
  if (!Array.isArray(filenames)) filenames = [filenames];
  iterateFiles(filenames, `* Checking file doesn't exist... `, fname => {
    if (!fs.existsSync(fname)) {
      console.log(`[Not exists]`);
      return fname;
    } else {
      return fileCheckError(fname);
    }
  });
}
