# npm jsonScript

```js
o= {
  start:    [ $series, 'test', 'build', 'deploy' ],
  //start:    [ $series, [ 'test', 'build', 'deploy' ] ],
  //start:    { $series: [ 'test', 'build', 'deploy' ] },
  test: {
    default:  {
      $parallel: [ 'test1', 'test2' ]
    },
    default2: () => this.parallel(
      'test1',
      'test2'
    ),
    test1:    [
      $parallel,
      [
        () => this.cmd('eslint -f unix .'),
        () => 'jsinspect --ignore \'coverage|test\'',
      ],
      () => this.error ? 'stop' : '',
    ],
    test2:    [ $parallel, [ 'lint', '' ] ]
  },
  git: {
    commit:        'git commit -am "commit by \'git.commit\'"',
    push:          'git push --follow-tags',
    commitAndPush: () => {
      return this.cmd('nps git.commit && nps test && nps git.push"'),
    }
  },
}  
```







```json
{
  "action1": "action2-1",
  "action2": { 
    "action2-1": "value1", 
    "action2-2": "value2",
  },
  "action3": { "01": "value1", "02": "value2"  },
  "action4": { "key1": "value1", "key2": "value2"  },
  "action5": [ "element1", "element2" ]
}        
```




```json
{
  "actionName1": "actionArgument",
  "actionName2": { "parameterKey1": "parameterValue1", "parameterKey2": "parameterValue2"  },
  "actionName3": [ "element1", "element2" ]
}
```


- `function`: 
If `actionArgument` is a function, this function will be called with the single argument `{ action, context, result }` and `result` value will be set to the result returned by a function. 
Function may modify `context` object.
Functions are not supported by nor by `JSON` nor by `JSON5` notations and may be used only if `json-script` code is defined inside `js` file.

```json
{
  "print_context": ({ action, context, result }) => { 
    console.log(context); 
    return "some-string";
  }
}                                                                                                                                   
```


- `string`: If `actionArgument` is a string, it first will be considered as another action name and the lookup will be done to find this action name in the script. If the name will be found, this action will be executed.
If lookup did not succeed, it will be considered as external action. To handle this action <span style="color:red;"> virtual method `handleCommand` will be called with the single argument `{ action, context, result }` </span> and `result` value will be set to the result returned by a function.

```json
{
  "first": "second",
  "second": "third",
  "third": () => console.log('Third action')
}
```

- `array`: If `actionArgument` is an array, each of its elements will be processed consequently as a separate `actionArgument`. When the actionValue will be handled, the execution will continue:

```json
{
  "do_in_sequence": [
    "subroutine1",
    "subroutine2",
    () => console.log('done')
  ],
  "subroutine1": [ 
    () => console.log('subroutine1')
  ],
  "subroutine2": [ 
    () => console.log('subroutine2')
  ]
} 
```

- `object`: if `actionArgument` is an object

```json
{
  "prog": [
    "test",
    [ "test" ],
    [ "set", { "a": 1 } ]
  ],
  "test": ()=>{console.log('this is test');},
  "simpleProgram": {
    "title": "This is a title",
    "$title": "This is a title",
    // "$code": [],
    // "sequence": [],
    "actions": [
      //
      // to put several ops in same array seems to be bad idea:
      //   "$set", 
      //   "a", 
      //   1,
      //   "$set", "a", 1,
      // 
      // operator with its args must be separated from other operators
      // by grouping into separate array or object
      // to clearly show the end of arguments 
      // (though in shell for example it is not required)
      //   [ "$set", "a", 1 ],  
      //   [ "$set", ["a",1] ],
      //
      // if operator is defined as an object, it must have single operation
      { "$set": [ "a", 1 ] }, 
      { "$set": { "a": 1, "b": 2 } },  
      //
      { "$get": [ "a" ] },
      { "$add": [ "a", 1 ] },
      { "$inc": [ "a", 1 ] },
      { "$set":   "c" },
      [ "$if", "label1", "label2" ],
      { "$goto": "label3" },
      { "$print": "c" },
    ],
    "$action": "..........",
  },
  "$set": ({action, parameters /*args*/, context, result}) => {
    _.set(context, parameters[0], parameters[1]);
    parameters.splice(0,2);
  }
//  "$set": ({action, parameters /*args*/, context, result}) => {
//    if (typeof parameters === 'string') object[parameters] = result; 
//    else Object.assign(context, parameters);
  },
  "   
}
```



!!! do we really need these fns?
`before`
`after`

```json
{
  "actionObject": {
    "$action": "..........",
    "before": ({ action, context, result }) => { return result; }, 
    "after":  ({ action, context, result }) => { return result; } 
  },
  "$set":    
}
```



## `options`

- `maxSteps` (default `1000`) - Infinite loops prevention
- `beforeEach`
- `afterEach`





---
_Created by alykoshin on 24.02.19_
