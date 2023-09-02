import {$} from "execa";

import {execute} from "../exec.ts";
import {FullConfig} from "../config.ts";
import {log_data} from "../log.ts";

export interface BuildAction {
  action: 'build'
  config: {
    target: string
  }
}

export async function action_build({config}: BuildAction, fullConfig: FullConfig) {
  const {target} = config;
  const log = (s: number | string) => log_data(s, target);

  const env = {
    CONFIG_ENV: target, // 'top100',
  }

  const $$ = $({
    cwd: fullConfig.base_dir,
    env,
    // // stdio: 'inherit',
    // stdin: 'inherit',
    // stdout: 'pipe',
    // stderr: 'pipe',
  });

  const command_line = `webpack --mode production`;

  await execute($$, command_line, log);
}

// export async function build_all({config}: BuildAction, fullConfig: FullConfig) {
//   const target_names = config.targets;
//   await Promise.all(target_names.map(t => _build_prod_one(t, config, fullConfig)));
// }
