import * as path from 'path';
//
import {BasicActivity} from '../basic/';
import {ActivityDefinition, GenericActivity} from '../generic/';
import {Cmd, Spawn} from '../../helpers/spawn';
//

const MONGO_ACTIONS: ActivityDefinition = {
  _backup:  [
    [ "$print", "Backing up database..." ],
    [ "$exec", "mongodump --host ${host} --port ${port}  --out \"${dir}\"" ],
    [ "$print", "Done." ],
  ],
  _restore: [
    [ "$print", "Restoring database..." ],
    [ "$exec", "mongorestore --host ${host} --port ${port}  --dir \"${dir}\" ${ drop ? \"--drop\" : \"\"}" ],
    [ "$print", "Done." ],
  ],
};


interface MongoUtilsOptions {
  baseDir: string
  host: string
  port: string
  drop_on_restore: boolean
}

class MongoActivity extends GenericActivity {
  options: MongoUtilsOptions
  spawn: Cmd
  basicActivity: BasicActivity

  constructor(options: MongoUtilsOptions) {
    super();
    this.options = options;
    this.spawn = Spawn();
    this.basicActivity = new BasicActivity(MONGO_ACTIONS);
    this.basicActivity.addMethods(this);
  }

  _getBackupDir() {
    const nowStr = (new Date()).toISOString();
    const dir = path.join(this.options.baseDir, nowStr);
    return dir;
  }

  // /**
  //  *
  //  * @param {String} host
  //  * @param {Number} port
  //  * @param {String} dir
  //  * @returns {Promise<String>}
  //  * @private
  //  */
  //async _backup({ host, port, dir }) {
  //  const cmd = `mongodump --host ${host} --port ${port}  --out "${dir}"`;
  //  return await this.spawn._spawnExecutePromised(cmd);
  //}

  async backup() {
    const dir = this._getBackupDir();
    // const res = await this._backup({
    const res = await this['_backup']({
      host: this.options.host,
      port: this.options.port,
      dir,
    });
    return dir;
  }


  // /**
  //  *
  //  * @param {String} host
  //  * @param {Number} port
  //  * @param {String} dir
  //  * @param {Boolean} drop
  //  * @returns {Promise<String>}
  //  * @private
  //  */
  //async _restore({ host, port, dir, drop }) {
  //  const dropOption = drop ? '--drop' : '';
  //  const cmd = `mongorestore --host ${host} --port ${port}  --dir "${dir}" "${dropOption}"`;
  //  return await this.spawn._spawnExecutePromised(cmd);
  //}

  async restore(dir: string) {
    // const result = await this._restore({
    const result = await this['_restore']({
      host: this.options.host,
      port: this.options.port,
      dir,
      drop: this.options.drop_on_restore,// ? '--drop' : '',
    })
  }

}


module.exports = MongoActivity;
