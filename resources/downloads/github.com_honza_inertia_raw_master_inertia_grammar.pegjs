{

  function partition(n, coll) {
      if (coll.length % n !== 0) {
          throw Error('Uneven number of elements.');
      }

      if (coll.length === 0) {
          return [];
      }
      return [coll.slice(0, n)].concat(partition(n, coll.slice(n)));
  }

  function makeObject(arr) {
    var pairs = partition(2, arr);
    var properties = map(function(p) {
      var k = p[0], v = p[1];
      return {
        key: k,
        value: v
      }
    }, pairs);

    return {
        type: 'ObjectExpression',
        properties: properties
    }

  }

  function processCallExpression(s) {
    var callee = first(s),
        args = rest(s)

    args = map(function(s) {
      if (s.expression && s.expression.type === 'CallExpression') {
        return s.expression;
      } else {
        return s;
      }
    }, args);

    return {
      type: 'ExpressionStatement',
      expression: {
        type: 'CallExpression',
        callee: callee,
        'arguments': args
      }
    }

  }

  function liftExpression(s) {
    if (s.type === 'ExpressionStatement') {
      return s.expression;
    } else {
      return s;
    }
  }

  function genericArithmeticOperation(operator) {
      return function(s) {
          if (s.length === 2) {
              return {
                  type: 'BinaryExpression',
                  operator: operator,
                  left: first(s),
                  right: first(rest(s))
              };
          }

          if (s.length === 1) {
              return first(s);
          }

          return {
              type: 'BinaryExpression',
              operator: operator,
              left: first(s),
              right: genericArithmeticOperation(operator)(rest(s))
          };
      };
  }

  var builtins = {
    '+': genericArithmeticOperation('+'),
    '-': genericArithmeticOperation('-'),
    '*': genericArithmeticOperation('*'),
    '/': genericArithmeticOperation('/'),
    '=': genericArithmeticOperation('==='),
    '!=': genericArithmeticOperation('!=='),
    '>': genericArithmeticOperation('>'),
    '>=': genericArithmeticOperation('>='),
    '<': genericArithmeticOperation('<'),
    '<=': genericArithmeticOperation('<='),
    'list': function(s) {
      return {
        type: 'ArrayExpression',
        elements: s
      }
    },
    'if': function(s) {
      return {
        type: 'CallExpression',
        callee: {
          type: 'FunctionExpression',
          id: null,
          params: [],
          body: {
            type: 'BlockStatement',
            body: [{
              type: 'IfStatement',
              test: first(s).expression ? first(s).expression : first(s),
              consequent: {
                type: 'BlockStatement',
                body: [{
                  type: 'ReturnStatement',
                  argument: s[1].expression ? s[1].expression : s[1]
                }]
              },
              alternate: {
                type: 'BlockStatement',
                body: [{
                  type: 'ReturnStatement',
                  argument: s[2].expression ? s[2].expression : s[2]
                }]
              }
            }]
          }
        },
        'arguments': []
      }
    },
    'let': function(s) {
      var args = partition(2, first(s).elements),
          exprs = rest(s),
          body = [];

      body.push({
        type: 'VariableDeclaration',
        declarations: map(makeDec, args),
        kind: 'var'});

      if (exprs.length > 1) {
        var initial = init(exprs);
        for (var i = 0; i < initial.length; i++ ) {
          body.push(initial[i]);
        }
      }

      body.push({
        type: 'ReturnStatement',
        argument: last(exprs)[0].expression
      });


      return {
        type: 'CallExpression',
        callee: {
          type: 'FunctionExpression',
          id: null,
          params: [],
          body: {
            type: 'BlockStatement',
            body: body
          }
        },
        'arguments': []
      };
    }
  };

  function makeDec(p) {
    var name = p[0], value = p[1];

    return {
      type: 'VariableDeclarator',
      id: name,
      init: value.expression ? value.expression : value
    };
  }

  function numberify(n) {
    return parseInt(n.join(""), 10);
  }

  function map(fn, arr) {
    var result = [];
    for (var i = 0; i < arr.length; i++) {
        result.push(fn(arr[i]));
    }
    return result;
  }

  function makeStr(n) {
    return map(function(i) {
      return i[1];
    }, n).join("");
  }

  function makeIdent(n) {
    return map(function(i) {
      var c = i.toLowerCase();
      if (c === '-') {
        c = '_';
      }
      return c;
    }, n).join("");
  }

  function rest(a) {
    return a.slice(1);
  }

  function first(a) {
    if (a.length > 0) {
      return a[0];
    } else {
      return null;
    }
  }

  function init(a) {
    return a.slice(0, -1);
  }

  function last(a) {
    return a.slice(-1);
  }

  function returnStatement(s) {
    s = first(s);
    return [{
      type: 'ReturnStatement',
      argument: s.expression ? s.expression : s
    }];
  }

  var log = console.log;
}


program
  = _ s:sexp+ "\n"*  { return {
      type: 'Program',
      body: s
    };}

sexp
  = _ a:atom _ { return a; }
  / _ l:list _ { return l; }
  / _ v:vector _ { return v; }
  / _ o:object _ { return o; }

atom
  = d:[0-9]+ _ { return {type: 'Literal', value: numberify(d)}; }
  / '"' d:(!'"' sourcechar)* '"' _ { return {type: 'Literal', value: makeStr(d) }}
  / s:[-+/*_<>=a-zA-Z\.!]+ _ { return {type: 'Identifier', name: makeIdent(s)};}

sourcechar
  = .

list
  = "()" { return []; }
  /  _ "(" _ s:sexp+ _ ")" _ {
    if (first(s).name === 'def') {
      return {
        type: 'VariableDeclaration',
        declarations: [{
          type: 'VariableDeclarator',
          id: s[1],
          init: s[2].expression? s[2].expression : s[2]
        }],
        kind: 'var'
      };
    }

    if (first(s).name === 'fn') {
      return {
        type: 'FunctionExpression',
        id: null,
        params: s[1].elements ? s[1].elements : s[1],
        body: {
          type: 'BlockStatement',
          body: init(rest(rest((s)))).concat(returnStatement(last(rest(s))))
        }
      };
    }

    if (Object.keys(builtins).indexOf(first(s).name) > -1) {
      return builtins[first(s).name](rest(s));
    }

    return processCallExpression(s);

  }

vector
  = "[]" { return {type: 'ArrayExpression', elements: []};}
  / _ "[" _ a:atom+ _ "]" _ { return {type: 'ArrayExpression', elements: a};}
  / _ "[" _ o:object+ _ "]" _ { return {type: 'ArrayExpression', elements: o};}
  / _ "[" _ s:sexp+ _ "]" _ { return {
    type: 'ArrayExpression',
    elements: map(liftExpression, s)};}

object
  = "{}" { return {type: 'ObjectExpression', properties: []}; }
  / _ "{" _ a:atom+ _ "}" _ { return makeObject(a); }

comment
  = ";;" s:(!"\n" sourcechar)* "\n"

__
  = [\n, ]

_
  = (__ / comment)*
