import axios from "axios";
import * as fs from 'fs/promises'
import * as path from 'path'
import * as cheerio from 'cheerio'

import {cleanup} from './fetchErrors/utils'
import {fetchNodeErrors} from './fetchErrors/fetchNodeErrors'
import {fetchLinuxErrors} from './fetchErrors/fetchLinuxErrors'


const thisFileDir = __dirname;
const cwd = process.cwd();
const outDir = path.resolve(cwd, './tools/resources');

async function run() {
  await cleanup(outDir);
  await fetchNodeErrors(outDir);
  await fetchLinuxErrors(outDir);
}

run();
