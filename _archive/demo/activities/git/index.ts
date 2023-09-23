import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import {Octokit} from 'octokit';
import {RequestError} from "@octokit/request-error";
import * as _ from 'lodash';
import gitconfig from 'git-config';

import {Activity, ActivityActionsDefinition} from "../../../../src/lib/config";


const GIT_ACTIONS: ActivityActionsDefinition = {
  default: [
    'queryClean'
  ],
  // "readGithubUsername": [
  //   "$exec", ""
  // ],
  "queryClean": ['series',
    // "$quote", [
    ["$print", "Ensuring Git directory is clean..."],
    ["$exec", "git status --untracked-files=no --porcelain"]
    // ]
  ],
  "queryCommitHash": ["$exec", "git rev-parse --short HEAD"],
  "queryBranch": ["$exec", "git rev-parse --abbrev-ref HEAD"],
  "checkoutBranch": ["$exec", "git checkout \"${branch}\""],
  "add": ["$exec", "git add \"${filename}\""],
  "commit": ["$exec", "git commit -m \"${message}\""],
  "tag": ["$exec", "git commit -m \"${message}\""],
  "push": ["$exec", "git push --follow-tags"],
  "getInit":            "git init",
  "gitRemoteAdd":       "git remote add origin https://github.com/${username}/${repository}.git",
  "gitAddAll":          "git add --all",
  "gitCommitFirst":     "git commit -am \"First commit\"",
  "gitPushSetUpstream": "git push --set-upstream origin master",
  testEcho: [
    //[
    "$exec",
    //[
    // "$quote"
    "echo test1",
    "echo test2"
    //],
  ],

  initAndPush: [
    "$exec",
    //[
    // "getInit",
    "git init",
    // [ "$exec", "git init" ],
    //"gitRemoteAdd",
    "git remote add origin https://github.com/${username}/${repository}.git",
    // [ "$exec", "git remote add origin https://github.com/${username}/${repository}.git" ],
    //"gitAddAll",
    //{ action: "gitAddAll", }
    "git add --all",
    //"gitCommitFirst",
    "git commit -am \"First commit\"",
    //"gitPushSetUpstream",
    "git push --set-upstream origin master",
    //],
  ],
  //initAndPush: [
  //  [ "$print", "initializing git repository" ],
  //  "$exec", [
  //    "git init",
  //    "git remote add origin https://github.com/${username}/${repository}.git",
  //    "git add --all",`
  //    "git commit -am \"First commit\"",`
  //    "git push --set-upstream origin master",
  //  ],
  //],

  async ensureClean(action, parameters, {runner, fullConfig, level, logger}) {
    // const git_clean = await this.queryClean();
    // const git_clean = await this['queryClean']();
    const git_clean = await runner.eval('queryClean', fullConfig, {level, logger});

    if (!git_clean) {
      console.log(`Git directory is clean`);
    } else {
      const m = `* ERROR: Git directory not clean. Please commit or stash the changes before the build.`;
      console.error(m);
      throw new Error(m);
    }
  }

};
type GitActionKey = keyof typeof GIT_ACTIONS;

type GitActionsType = typeof GIT_ACTIONS

// interface GitActivityWithActions extends GitActionsType, GitActivity {}

interface GitCredentials {
  protocol: string,
  username: string,
  password: string,
  hostname: string,
}


interface GitActivityOptions {

}

class GitActivity /*extends GenericActivity */ {
  octokit?: Octokit
  options: GitActivityOptions
  // spawn: Cmd
  gitconfig: typeof gitconfig;

  constructor(options: GitActivityOptions) {
    // super({}, options);
    // super();
    this.options = options || {};

    // this.spawn = Spawn();
    this.gitconfig = gitconfig.sync();
  }

  readGitCredentials() {
    if (process.platform === 'win32') throw new Error(`readGitCredentials() Not supported for Windows`)

    const GIT_CREDENTIALS_FNAME = '.git-credentials';
    const fname = path.resolve(os.homedir(), GIT_CREDENTIALS_FNAME);
    const text = fs.readFileSync(fname, {encoding: 'utf8'});
    const lines = text.split(/\r?\n/);
    const credentials: GitCredentials[] = [];
    lines.forEach(line => {
      // example: https://alykoshin:111111e61f359ab3f@github.com
      const matches = line.match(/^(\S+):\/?\/?(\S+):(\S+)@([-a-zA-Z0-9\.]+)$/)
      if (matches && matches.length === 5) credentials.push({
        // match:  matches[0],
        protocol: matches[1],
        username: matches[2],
        password: matches[3],
        hostname: matches[4],
        // index: matches.index
        // input: matches.input
        // groups: matches.groups
      });
    });
    return credentials;
  }

  readSpecificGitCredentials({hostname, username}: { hostname: string, username: string })
    : GitCredentials {
    //console.log(`readSpecificGitCredentials():`, {hostname, username});
    const credentials = this.readGitCredentials();
    const found = credentials.find(cred =>
      cred.hostname === hostname &&
      cred.username === username
    );
    //console.log(`readSpecificGitCredentials():`, found);
    if (!found) throw new Error('Credentials not found');
    return found;
  }

  readGithubUsername(): string {
    const username = _.get(this.gitconfig, 'github.user');
    if (!username) throw new Error('Unable to read github.user from .git-config');
    //console.log(`readGithubUsername(): "${username}"`);
    return username;
  }

  readGithubToken(): string {
    const username = this.readGithubUsername();
    const credentials = this.readSpecificGitCredentials({hostname: 'github.com', username});
    const token = credentials && credentials.password;
    if (!token) {
      throw new Error('Unable to read github token from .git-credentials');
    }
    //console.log(`readGithubToken(): "${token}"`);
    return token;
  }

  _createOctokit() {
    const GIT_DEBUG = false;
    const token = this.readGithubToken();
    const octokit = new Octokit({
      auth: `token ${token}`,
      //auth: `token e6019da3a1d536369e61f359ab3fa91ddb5508f0`,
      /*
            auth: {
              username: 'alykoshin',
              password: 'alg12rk',
              async on2fa() {
                // example: ask the user
                return prompt('Two-factor authentication Code:')
              },
              },
      */
      log: GIT_DEBUG
        ? console
        : {
          debug: () => {
          },
          info: () => {
          },
          warn: console.warn,
          error: console.error
        },
    });
    return octokit;

  }

  // async ensureClean() {
  //   // const git_clean = await this.queryClean();
  //   const git_clean = await this['queryClean']();
  //
  //   if (!git_clean) {
  //     console.log(`Git directory is clean`);
  //   } else {
  //     const m = `* ERROR: Git directory not clean. Please commit or stash the changes before the build.`;
  //     console.error(m);
  //     throw new Error(m);
  //   }
  // }

  _checkGithubHttpError(e: Error) {
    if (e.name === 'HttpError' && (e as RequestError).status === 401) {
      console.error('*');
      console.error('* This package uses:');
      console.error('*   github.user from ~/.git-config');
      console.error('*   token from ~/.git-credentials');
      console.error('*');
      console.error('* Please ensure they are still valid (may also be removed by Github automatically if found in public repository):');
      console.error('* https://github.com/settings/tokens');
      console.error('*');
      throw new Error('* Invalid Github credentials');
    } else {
      console.error(e);
    }
  }

  async createGithubRepo({username, name, description}: { username: string, name: string, description: string }) {
    if (!this.octokit) this.octokit = this._createOctokit();

    //console.log('createGithubRepo', { username, name, description })
    try {
      const res = await this.octokit.rest.repos.createForAuthenticatedUser({
        user: username,
        name,
        description,
        //type: 'public'
      })
      console.log('* repository successfully created');
      return true;

    } catch (e) {
      this._checkGithubHttpError(e as Error);
      throw e;
    }
    //this.octokit.repos.create({
    //    user:        this.githubName,
    //    name:        this.pkgName,
    //    description: this.pkgDesc
    //  }, function (err, res) {
    //    console.log('github.repos.create(): err:', err, 'res:', JSON.stringify(res));

    //  //self._gitInitAndPush(self.githubName, self.pkgName);
    //});
  }

}

export const activity: Activity = {
  base_dir: './demo',
  version: '2.5.22',
  actions: {
    ...GIT_ACTIONS,
  }
}

export default activity;
