import * as path from "path";
import {ActionMethodState, Actions} from "../../../../src/lib/runner";
import {Activity, ActivityActionsDefinition} from "../../../../src/lib/config";

const MONGO_ACTIONS: ActivityActionsDefinition = {
  default: [ 'print', `Please run one of $backup|$restore actions` ],
  $backup: [ 'list',
    [ "print", "Backing up database..." ],
    [ "_calcBackupDir" ],
    [ "print", "mongodump --host ${host} --port ${port}  --out \"${dir}\"" ],
    [ "print", "Done." ],
  ],
  $restore: [ 'list',
    [ "print", "Restoring database..." ],
    [ "_calcBackupDir"],
    [ "print", "mongorestore --host ${host} --port ${port}  --dir \"${dir}\" ${ drop_on_restore ? \"--drop\" : \"\"}" ],
    [ "print", "Done." ],
  ],
  async _calcBackupDir(action, parameters,
    {id, level, scopes, activity, runner, logger}: ActionMethodState
  ) {
    const nowStr = (new Date()).toISOString();
    const baseDir = String( scopes.get('baseDir') );
    const dir = path.join(baseDir, nowStr);
    // return dir;
    scopes.current().set('dir', dir);
  }
};

export const activity: Activity = {
  base_dir: './demo',
  version: '2.5.22',
  actions: {
    ...MONGO_ACTIONS,
  }
}

export default activity;
