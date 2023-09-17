import fs from 'fs/promises';
import {fn_check_params} from "../../lib/util";
import {ActionMethodState, Parameters} from "../../lib/runner";

type CpActionConfig = {
  source: string | string[],
  dest: string,
  dry?: boolean,
}

type CpAction = [
  action: 'cp',
  config: CpActionConfig
]

export async function cp(
  action: string,
  parameters: Parameters,
  {id, level, fullConfig, runner, logger}: ActionMethodState
) {
  fn_check_params(parameters, {exactCount: 1})
  const {source, dest, dry: dry_ } = parameters[0] as CpActionConfig;
  const dry = typeof dry_ !== 'undefined' ? dry_ : false;
  const sources = Array.isArray(source) ? source : [source];

  for (let src of sources) {
    logger.debug(`[cp] copying "${src}"`)
    if (dry) {
      logger.debug(`[cp] "dry" flag is set; skipping`);
    } else {
      await fs.cp(src, dest);
    }
  }
  logger.debug(`[cp] copied ${sources.length} dirs/files`)
}

export default cp;
