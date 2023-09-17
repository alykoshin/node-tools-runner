import {JsonScript, Token, TokenConditionFn, TokenEvaluateFn} from "../../old_jsonScript";

class GenericNamedStorage<T> {
  _values: { [name: string]: T }

  constructor() {
    this._values = undefined;
  }

  _add(name: string, value: T): void {
    throw new Error('Not implemented');
  }

  add(values: { [name: string]: T }) {
    throw new Error('Not implemented');
    //_.forEach(values, (value, indexOrKey, collection) => this._add(indexOrKey, value));
  }

  get(name: string): T {
    throw new Error('Not implemented');
  }

  has(name: string): boolean {
    return !!this.get(name);
  }

  ensureName(name: string): boolean {
    if (!name) throw new Error(`name is mandatory`);
    return true;
  }

  ensureUnique(name: string): boolean {
    this.ensureName(name);
    if (this.has(name)) throw new Error(`name must be unique`);
    return true;
  }

  find(predicate: FindPredicate<T>, fromIndex?: number) {
    // https://lodash.com/docs/#find
    // _.find(collection, [predicate=_.identity], [fromIndex=0])
    //Iterates over elements of collection, returning the first element predicate returns truthy for. The predicate is invoked with three arguments: (value, index|key, collection).
    return _.find(this._values, predicate, fromIndex);
  }

  forEach(cb: FindPredicate<T>) {
    // https://lodash.com/docs/#forEach
    // _.forEach(collection, [iteratee=_.identity])
    //Iterates over elements of collection and invokes iteratee for each element. The iteratee is invoked with three arguments: (value, index|key, collection). Iteratee functions may exit iteration early by explicitly returning false.
    //Note: As with other "Collections" methods, objects with a "length" property are iterated like arrays. To avoid this behavior use _.forIn or _.forOwn for object iteration.
    return _.forEach(this._values, cb);
  }

}


class ObjectNamedStorage<T> extends GenericNamedStorage<T> {

  constructor() {
    super();
    this._values = {};
  }

  _addOne(name: string, value: T) {
    this.ensureUnique(name);
    if (this.has(name)) throw new Error(`name "${name}" must be unique`);
    this._values[name] = value;
  }

  get(name: string): T {
    return this._values[name];
  }

  has(name: string): boolean {
    return !!this.get(name);
  }

  add(values: { [name: string]: T }) {
    //   values = sanitizeArray(values);
    _.forEach(values, (value: T, indexOrKey: string, collection: {
      [name: string]: T
    }) => this._addOne(indexOrKey, value));
  }

}


export interface Token {
  condition: TokenConditionFn
  convert//: TokenConvertFn
  evaluate: TokenEvaluateFn
}

interface TokenLookupRes {
  type: string,
  def: Token,
}

class TokenStorage extends ObjectNamedStorage<Token> {

  constructor() {
    super();
  }

  _lookup(jsonScript: JsonScript, data: TokenLookupArgs): TokenLookupRes {
    // iterate all token type definition

    //for (let tokenTypeName in tokenTypes) if (tokenTypes.hasOwnProperty(tokenTypeName)) {
    //  const def = tokenTypes[tokenTypeName];
    //  const fn = def.condition;
    //  if (typeof fn !== 'function') throw new Error(`def.condition must be a function`);
    //
    //  // check the condition for each definition
    //  if (fn.call(this, data)) {
    //    // if condition is true
    //    const result = { type: tokenTypeName, def };
    //    this.debug('_lookup', {result});
    //    return result;
    //  }
    //}

    let result: TokenLookupRes | undefined;
    this.forEach((value: Token, indexOrKey, collection) => {
      const conditionFn = value.condition;
      if (typeof conditionFn !== 'function') throw new Error(`def.condition must be a function`);

      // console.log('token:', indexOrKey, data)
      // console.log('=======================this:', this)

      if (conditionFn.call(jsonScript, data)) {
        // found token
        result = {type: indexOrKey, def: value};
        return false; // stop the iteration
      }
      // continue iteration
    });

    //console.log('found', found);

    // if condition is true
    if (result) {
      //this.debug('_lookup', {result});
      return result;

    } else {
      // we checked all definitions and found nothing
      console.error('_lookup: data:', data);
      throw new Error('Unable to find token type');
    }
  }


}
