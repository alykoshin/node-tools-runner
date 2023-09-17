
class GenericScript {
  beforeEach: TokenEvaluateFn
  afterEach: TokenEvaluateFn
  maxSteps: number
  maxLevels: number
  _steps: number
  _level: number
  tokens: TokenStorage

  constructor(/*actions: ActivityDefinition,*/ options: GenericScriptOptions = {}) {
    const {beforeEach, afterEach, maxSteps, maxLevels} = options;

    this.beforeEach = beforeEach;
    this.afterEach = afterEach;

    this.maxSteps = (typeof maxSteps !== 'undefined') ? maxSteps : DEFAULT_MAX_STEPS;
    this.maxLevels = (typeof maxLevels !== 'undefined') ? maxLevels : DEFAULT_MAX_LEVELS;
    this._steps = 0; // counter to prevent infinite loops
    this._level = 0; // counter to prevent stack overflow

    //this.TOKEN_BASE_TYPES = {};
    this.tokens = new TokenStorage();
  }


}

//

export class JsonScript extends GenericScript {
  actions: ActivityDefinition

  //

  async __evaluate(def: Token, {action, parameters, context, result: prevResult}: TokenEvaluateFnArgs) {

    let newResult = prevResult;
    let res;


    // call pre-processing callbacks
    res = await this._handlerFn([
        this.beforeEach,
        action.before
      ],
      {action, parameters, context, result: newResult}
    );



    //this.debug('__evaluate:', {res =});
    if (typeof res !== 'undefined') newResult = res;



    // call post-processing callbacks
    res = await this._handlerFn([
        action.after,
        this.afterEach
      ],
      {action, parameters, context, result: newResult}
    );
  }


  async _handlerFn(fns: TokenEvaluateFn | TokenEvaluateFn[], {result, ...rest}: TokenEvaluateFnArgs) {
    fns = (Array.isArray(fns) ? fns : [fns]);
    await asyncUtils.asyncForEach(fns, async (fn: TokenEvaluateFn) => {
      const res = (typeof (fn) === 'function')
        ? await fn.call(this, {...rest, result})
        : result;
      if (typeof res !== 'undefined') result = res;
    }, undefined);
    return result;
  }


  _hasNextParam(parameters
                // : Parameters
  ): boolean {
    return (parameters.length > 0);
  }


  _getNextParam(parameters
                // : Parameters
  ): Parameter {
    const p = parameters.splice(0, 1)[0];
    this.debug('_getNextParam:', {p});
    return p;
  }




  _executeActionDefinitionBefore({name, definition, parameters, context, result}: TokenExecuteFnArgs) {
    if (typeof definition === 'undefined') throw new Error(`Action definition cannot be empty`);
    this._incSteps();
    this._incLevel();
    this.debug('_executeActionBefore:', {name, definition, parameters, context, result});
  }

  _executeActionDefinitionAfter({name, definition, parameters, context, result}: TokenExecuteFnArgs) {
    this.debug('executeActionAfter:', {result});
    this._decLevel();
  }


}


