import {Parameters} from "../../lib/runner";
import {Activity, ActivityActionsDefinition} from "../../lib/config";
import $sbcl from "../../actions/$sbcl/";

const actions: ActivityActionsDefinition = {
  ...$sbcl,
  default: ['$series', ['$echo', 'This will test operators'],
    // ['plus'],
    // ['minus'],
    // ['mult'],
    // ['div'],
    // ['eq'],
    ['neq'],
    // ['list'],
    // ['length'],
    // ['$echo', 
    //   '$expect:\n',
    //   '  OK:   ${ $expect_ok_count }\n',
    //   '  FAIL: ${ $expect_fail_count }'],
  ],
  plus: ['$series',
    ['$echo', '+'],

    ["$expect", ["+", 0], [ "$sbcl-to-int",  "(+ 0)" ] ],
    ["$expect", ["+", 4], [ "$sbcl-to-int",  "(+ 4)" ] ],
    ["$expect", ["+", -4], [ "$sbcl-to-int",  "(+ -4)" ] ],
    ["$expect", ["+", 1, 2], [ "$sbcl-to-int",  "(+ 1 2)" ] ],
    ["$expect", ["+", 1, 2, 3], [ "$sbcl-to-int",  "(+ 1 2 3)" ] ],
    ["$expect", ["+", ["+", 101, 102], 1, 2], [ "$sbcl-to-int",  "(+ (+ 101 102) 1 2)" ] ],
    ["$expect", ["+", 1, ["+", 101, 102], 2], [ "$sbcl-to-int",  "(+ 1 (+ 101 102) 2)" ] ],
    ["$expect", ["+", 1, 2, ["+", 101, 102]], [ "$sbcl-to-int",  "(+ 1 2 (+ 101 102))" ] ],
  ],
  minus: ['$series',
    ['$echo', '-'],

    // ["$expect", ["-"], 0], // CLisp gives an error for '-','/' without parameters (however ok for '+' and '*')
    ["$expect", ["-", 0], [ "$sbcl-to-int",  "(- 0)" ] ],
    ["$expect", ["-", 1], [ "$sbcl-to-int",  "(- 1)" ] ],
    ['$expect', ["-", 2, 3], [ "$sbcl-to-int",  "(- 2 3)" ] ],
    ['$expect', ["-", 3, 2], [ "$sbcl-to-int",  "(- 3 2)" ] ],
    ['$expect', ["-", 2, 3, 4], [ "$sbcl-to-int",  "(- 2 3 4)" ] ],
    ["$expect", ["-", 4, ["-", 2, 1]], [ "$sbcl-to-int",  "(- 4 (- 2 1))" ] ],
  ],
  mult: ['$series',
    ['$echo', '*'],

    ["$expect", ["*"], [ "$sbcl-to-int",  "(*)" ]],
    ["$expect", ["*", 2], [ "$sbcl-to-int",  "(* 2)" ]],
    ['$expect', ["*", 2, 3], [ "$sbcl-to-int",  "(* 2 3)" ]],
    ['$expect', ["*", 2, 3, 4], [ "$sbcl-to-int",  "(* 2 3 4)" ]],
    ["$expect", ["*", 2, ["*", 3, 4]], [ "$sbcl-to-int",  "(* 2 (* 3 4))" ]],
  ],
  div: ['$series',
    ['$echo', '/'],

    // ["$expect", ["/"], [ "$sbcl-to-int",  "(/)" ]], // CLisp gives an error for '-','/' without parameters (however ok for '+' and '*')
    ["$expect", ["/", 2], [ "$sbcl-to-int",  "(/ 2)" ]],
    ['$expect', ["/", 6, 3], [ "$sbcl-to-int",  "(/ 6 3)" ]],
    ['$expect', ["/", 24, 3, 2], [ "$sbcl-to-int",  "(/ 24 3 2)" ]],
    ["$expect", ["/", 1000, ["/", 10, 2]], [ "$sbcl-to-int",  "(/ 1000 (/ 10 2))" ]],
  ],
  eq: ['$series',
    ['$echo', '='],

    ['$expect', ["=", 1], [ "$sbcl-to-bool",  "(= 1)" ]],

    ["$expect", ["=", 1, 1],    [ "$sbcl-to-bool",  "(= 1 1)" ]],
    ["$expect", ["=", 1, 1, 1], [ "$sbcl-to-bool",  "(= 1 1 1)" ]],

    ['$expect', ["=", 1, 2],    [ "$sbcl-to-bool",  "(= 1 2)" ]],
    ['$expect', ["=", 1, 2, 3], [ "$sbcl-to-bool",  "(= 1 2 3)" ]],
    ['$expect', ["=", 1, 2, 2], [ "$sbcl-to-bool",  "(= 1 2 2)" ]],
    ['$expect', ["=", 1, 1, 2], [ "$sbcl-to-bool",  "(= 1 1 2)" ]],
    ['$expect', ["=", 2, 1, 1], [ "$sbcl-to-bool",  "(= 2 1 1)" ]],
    ['$expect', ["=", 1, 2, 1], [ "$sbcl-to-bool",  "(= 1 2 1)" ]],
  ],
  neq: ['$series',
    ['$echo', '/='],

    ['$expect', ["/=", 1], [ "$sbcl-to-bool",  "(/= 1)" ]],

    ['$expect', ["/=", 1, 1],    [ "$sbcl-to-bool",  "(/= 1 1)" ]],
    ['$expect', ["/=", 1, 1, 1], [ "$sbcl-to-bool",  "(/= 1 1 1)" ]],

    ['$expect', ["/=", 1, 2],    [ "$sbcl-to-bool",  "(/= 1 2)" ]],
    ['$expect', ["/=", 1, 2, 3], [ "$sbcl-to-bool",  "(/= 1 2 3)" ]],
    ['$expect', ["/=", 1, 2, 2], [ "$sbcl-to-bool",  "(/= 1 2 2)" ]],
    ['$expect', ["/=", 1, 1, 2], [ "$sbcl-to-bool",  "(/= 1 1 2)" ]],
    ['$expect', ["/=", 2, 1, 1], [ "$sbcl-to-bool",  "(/= 2 1 1)" ]],
    ['$expect', ["/=", 1, 2, 1], [ "$sbcl-to-bool",  "(/= 1 2 1)" ]],
  ],
  list: ['$series',
    ['$echo', 'list'],

    ['$expect', [ "list" ], [ "list" ] ],
    ['$expect', [ "list", 1 ], [ "list", 1 ] ],
    ['$expect', [ "list", 1, 2, 3 ], [ "list", 1, 2, 3 ] ],
  ],
  length: ['$series',
    ['$echo', 'length'],

    ['$expect', [ "length", [ "list" ] ], [ "$sbcl-to-int",  "(length (list))" ] ],
    ['$expect', [ "length", [ "list", 1 ] ], [ "$sbcl-to-int",  "(length (list 1))" ] ],
    ['$expect', [ "length", [ "list", 1, 2, 3 ] ], [ "$sbcl-to-int",  "(length (list 1 2 3))" ] ],
  ],
    // {"+": [5, {'*': [2,3] }] },
    // {"+": [5, ['*': [2, 3 ]]] },
    // ["*", 1, ["+", "x" ("-", "y", "y"))))
    //
    // [ 'print_params', '[ "+", 1, [ "+", 1, 2 ] ]' ],
    // [ 'format', 't', [ "+", 1, [ '+', 1, 2 ] ] ],
    // 'print_res',
    //
    //[ '$expect',
    //  4,
    //  [
    //    [ "+", 1, [ '+', 1, 2 ] ],
    //    'print_res',
    //  ]
    //],
    // 
  // ],

}

export const activity: Activity = {
  base_dir: './demo',
  version: '2.5.22',
  actions: {
    ...actions,
  }
}

export default activity;
