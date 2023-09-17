import axios from "axios";
import * as cheerio from "cheerio";

import {
  debug,
  log,
  saveJson,
  warn,
  ErrorDescription,
  NodeErrors,
  getWrapperForFile,
  saveString,
  ErrorsGroup
} from "./utils";

export async function fetchLinuxErrors(outDir: string) {
  const debugId = 'Linux error codes'
  const url = `https://man7.org/linux/man-pages/man3/errno.3.html`;
  const outFilename = 'linuxErrors.json';

  log(`[${debugId}] Retrieving name/descriptions from "${url}"`)

  const response = await axios(url);
  // log(response)
  const strContent = response.data;
  // log(strContent)
  await saveString(outDir, 'linuxErrors.html', strContent, debugId)

  const $ = cheerio.load(strContent);

  //
  // select <pre> element containing header for the list
  //
  const headerText = "List of error names";
  const selection = $(`pre:contains(${headerText})`);
  debug(`selection.length: ${selection.length} selection[0].children.length ${selection[0].children.length}`);
  const htmlText = selection.html();

  //
  // as it is <pre> i.e. preformatted, we able to handle it line-by-line
  //
  // we can't parse it as HTML as the only way to differentiate name of the definition from the definitions itself
  // is to check if it starts at the beginning of the line;
  //
  // if we try to select all <b>name</b> we'll also retrieve the ones from inside the definitions
  //
  const lines = htmlText.split(/[\r\n]/ig);
  debug(`lines.length: ${lines.length}`);

  const codes: ErrorsGroup = {
    description: debugId,
    codes: {},
  };
  let start = false;
  let adding = false;
  let i = 0
  let name;

  while (i < lines.length) {
    const l = lines[i];
    if (start) {
      const m = l.match(/^\s{0,8}<b>(.*)<\/b>(.*)/i);
      if (m) {
        //
        // found new error name
        //
        adding = true;
        debug(`[${i}] [STRT] "${l}"`)

        name = m[1].trim();
        const description = m[2].trim();

        if (codes.codes[name] === undefined) {
          codes.codes[name] = m[2].trim();
        } else {
          warn(`"${name}" already assigned to value "${codes[name]}"`)
          const delim = (codes.codes[name] && description) ? ' ' : '';
          codes.codes[name] = codes.codes[name] + delim + description;
        }

      } else if (adding) {
        //
        // iterating lines inside the description (after the name)
        //
        debug(`[${i}] [CONT] "${l}"`)

        const description = l.trim();

        if (codes.codes[name] === undefined) {
          warn(`"${name}" not yet assigned`)
          codes.codes[name] = l.trim();
        } else {
          const delim = (codes.codes[name] && description) ? ' ' : '';
          codes.codes[name] = codes.codes[name] + delim + description;
        }

      } else {
        debug(`[${i}] [SKIP] "${l}"`)
      }
    } else if (l.indexOf(headerText) >= 0) {
      //
      // found headerText, starting to collect error names/descriptions
      //
      start = true;
    } else {
      // Not stared yet - skip line
    }
    i++;
  }
  log(`[${debugId}] Collected ${Object.keys(codes.codes).length} name/description pairs.`)

  const result = getWrapperForFile({data: codes, url});
  await saveJson(outDir, outFilename, result, debugId);
  return result;
}


