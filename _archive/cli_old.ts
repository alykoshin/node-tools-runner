#!/usr/bin/env node

'use strict';

import * as util from "util";
const path = require('path');
const argv = require('minimist')(process.argv.slice(2));

// const pkg = require('../package.json');
import pkg from '../package.json';
// const shelling = require('./index');
const lookup = require('./lib/lookupError');


function help() {
  console.log([
    '',
    `  Package name: ${pkg.name}`,
    '',
    `  Package description: ${pkg.description}`,
    '',
    `  Examples:`,
    `    node node_modules/${pkg.name}/cli.js`,
    '',
    `  spawn:`,
    `    node node_modules/${pkg.name}/cli.js spawn {command}`,
    `  lookup:`,
    `    node node_modules/${pkg.name}/cli.js lookup NOENT`,
    `  gen_certs:`,
    `    node node_modules/${pkg.name}/cli.js gen_certs ./demo/gen-certs-config.json`,
    `  keypress:`,
    `    node node_modules/${pkg.name}/cli.js keypress "Press any key"`,
    `  confirm:`,
    `    node node_modules/${pkg.name}/cli.js keypress "Confirm [Y/N]?"`,
    '',
    `  mongo backup:`,
    `    node node_modules/${pkg.name}/cli.js mongo backup ./demo/mongo-backup.json`,
    `  mongo backup+restore:`,
    `    node node_modules/${pkg.name}/cli.js mongo backup ./demo/mongo-backup.json ./demo/mongo-restore.json`,
    `  mongo restore:`,
    `    node node_modules/${pkg.name}/cli.js mongo restore ./demo/mongo-restore.json `,
    '',
  ].join('\n'));
}

function version() {
  console.log([
    '* version():',
    '* package.json version: ' + pkg.version,
    '* process.version: ' + process.version,
    ''
  ].join('\n'));
}


function getFileArgs(): {action: string, config: Object} {
  const action = process.argv[3];
  if (!action) throw new Error('Expecting action');

  const configFile = process.argv[4];
  if (!configFile) throw new Error('Expecting configFile');

  const config = require(path.resolve(configFile));

  return { action, config };
}


const getScriptArgument = (num: number = 4): Object => {
  let args    = {};
  const argv4 = process.argv[ num ];
  if (!argv4) throw new Error(`Expecting arguments for the script`);
  try {
    console.log('process.argv[4]:', process.argv[4])
    args = JSON.parse(argv4);
  } catch (e) {
    throw new Error(`Unable to parse arguments for the script`);
  }
  return args;
};



async function handleArgv() {
  if (argv.h || argv.help) {
    help();
    process.exit(0);

  } else if (argv.v || argv.version) {
    version();
    process.exit(0);
  }

  const activity = process.argv[ 2 ];
  if (activity === 'openssl') {
    const { action, config } = getFileArgs();

    const opensslActivity = new shelling.OpensslActivity();
    const res = await opensslActivity.startAction(action, config);
    process.exit(0);

  } else if (activity === 'test') {
    const testActivity = new shelling.TestActivity();

    testActivity.basicActivity.debug('* testActivity:', testActivity);

    const action = process.argv[3];
    if (!action) throw new Error('Expecting TestActivity action');
    if (!testActivity.getAction(action)) throw new Error(`Invalid TestActivity action "${action}"`);

    const args = getScriptArgument();

    console.log(`* test ${action} ${JSON.stringify(args)}`);
    const res = await testActivity.startAction(action, args);
    console.log('* RESULT:', util.inspect(res, {depth:null}));

    process.exit(0);

  } else if (activity === 'git') {
    const gitActivity = new shelling.GitActivity();
    const action = process.argv[3];
    if (!action) throw new Error('Expecting GitActivity action');
    if (!gitActivity.getAction(action)) throw new Error('Invalid GitActivity action');

    const args = getScriptArgument();

    console.log(`* git ${action} ${JSON.stringify(args)}`);
    const res = await gitActivity.startAction(action, args);
    console.log('* RESULT:', res);
    process.exit(0);

  } else if (activity === 'lookup') {
    const code = process.argv[ 3 ];
    console.log('* RESULT:', shelling.lookupError(code));
    process.exit(0);

  } else if (activity === 'keypress') {
    const msg = process.argv[ 3 ] || 'Press any key...';
    console.log('* RESULT:', await shelling.keypress(msg));
    process.exit(0);

  } else if (activity === 'confirm') {
    const msg = process.argv[ 3 ] || 'Confirm [Y/N]?';
    console.log('* RESULT:', await shelling.confirm(msg));
    process.exit(0);

  } else if (activity === 'mongo' && process.argv[3] === 'backup') {
    const backupConfigFile = process.argv[4];
    const backupConfig = require(path.resolve(backupConfigFile));
    const mongoUtils = new shelling.MongoActivity(backupConfig);

    const res1 = await mongoUtils.backup();
    console.log('* RESULT:', res1);
    const backupDir = res1;

    if (process.argv[5]) {
      if (await shelling.confirm('Restore [Y/N]?')) {
        const restoreConfigFile = process.argv[ 5 ];
        const restoreConfig     = require(path.resolve(restoreConfigFile));
        const mongoUtils        = new shelling.MongoActivity(restoreConfig);

        const res2 = await mongoUtils.restore(backupDir);
        console.log('* RESULT:', res2);
      } else {
        console.log('Skipped');
      }
    }

    process.exit(0);

  } else if (process.argv[2] === 'mongo' && process.argv[3] === 'restore') {
    const configFile = process.argv[4];
    const config = require(path.resolve(configFile));
    const mongoUtils = new shelling.MongoActivity(config);

    await mongoUtils.restore();
    process.exit(0);

  } else if (process.argv[ 2 ] === 'spawn') {
    const cmd = process.argv.slice(3);
    console.log('* COMMAND: "' + cmd + '"');
    await shelling.spawnCapture(cmd)
      .then((result: string) => {
        console.log('* RESULT: "' + result + '"');
        process.exit(0);
      })
      .catch((e: Error) => {
        console.log('* ERROR:');
        const code = (e as NodeJS.ErrnoException).code;
        if (code) {
          const description = lookup(code);
          if (!description.notFound) {
            console.error('* ' + description.short);
            console.error('* ' + description.long);
          }
        }
        console.error('* ', e);
        process.exit(-1);
      })
    ;
  } else {
    throw new Error('Invalid command');
  }
}

handleArgv();

//var main = require('./');
//
//main.exec(argv[0], function() {
//
//});
