#!/bin/node
const readline = require('readline-sync')
require('lodash.product')
const _ = require('lodash')

// Operations
function and(a, b) {
    return a && b
}

function or(a, b) {
    return a || b
}

function implies(a, b) {
    return b || !a;
}

//Curried
const cAnd = _.curry(and)
const cOr = _.curry(or)
const cImplies = _.curry(implies)

function startNegate(state) {
    let f = state.scope[0].pop()
    state.scope[0].push(vars => !f(vars))
}

function getLiteral(state) {
    let index = state.scope[0].pop()
    let f = state.scope[0].pop()
    state.scope[0].push(vars => f(vars[index]))
}

function startGroup(state) {
    state.scope.unshift([vars => vars])
}

function startAnd(state) {
    let f = state.scope[0].pop()
    state.scope[0].push(cAnd(f(vars)))
}

function startOr(state) {
    let f = state.scope[0].pop()
    state.scope[0].push(cOr(f(vars)))
}

function startImplies(state) {
    let f = state.scope[0].pop()
    state.scope[0].push(cImplies(f(vars)))
}

function endGroup(state) {
    let collapsed = state.scope.shift()[0]
    if (state.scope.length <= 0) {
        state.result = collapsed
    } else {
        let f = state.scope[0].pop()    // pop off current function
        state.scope[0].push(vars => f(collapsed(vars)))
    }
}

// Dictionaries
const SIMPLE = 0
const LATEX = 1
const symbols = {
//  Symbol:     function => [Simple,LaTeX]
    Literal:    getVars,
    True:       state    => ['T',   'T'],
    False:      state    => ['F',   'F'],
    LParen:     state    => ['(',   '('],
    RParen:     state    => [')',   ')'],
    Not:        state    => ['!',   '\\neg '],
    And:        state    => [' & ', ' \\wedge '],
    Or:         state    => [' | ', ' \\vee '],
    Implies:    state    => [' => ',' \\to ']
};

const SYMBOL = 0
const FUNCTION = 1
const NEXTTYPE = 2
const types = {
    //  Action:     [Symbol,            Function,       NextType]
    Variable:   {
        Not:        [symbols.Not,       startNegate,    'Variable'],
        Literal:    [symbols.Literal,   getLiteral,     'Operation'],
        Group:      [symbols.LParen,    startGroup,     'Variable']
    },
    Operation:  {
        And:        [symbols.And,       startAnd,       'Variable'],
        Or:         [symbols.Or,        startOr,        'Variable'],
        Implies:    [symbols.Implies,   startImplies,   'Variable'],
        End:        [symbols.RParen,    endGroup,       'Operation']
    }
};

// Utility
function range(a, b) {
    let start = 0
    let length = a
    if (typeof b !== "undefined") {
        start = a
        length = b
    }

    return [...Array(length).keys()]
        .map(i => i + start);
}

function getVars(state) {
    console.log(
        range(Object.keys(state.vars).length)
            .map(i => `(${i}) ${state.vars[Object.keys(state.vars)[i]]}`)
            .join('\n')
    )

    let response = parseInt(readline.question("> "))
    state.scope[0].push(response)
    let symbol = state.vars[response]
    return [symbol, symbol]
}

function menu(state) {
    let options = types[state.type]
    console.log(
        range(Object.keys(options).length)
            .map(i => `(${i}) ${Object.keys(options)[i]}`)
            .join('\n')
    )

    let response = parseInt(readline.question("> "))
    let key = Object.keys(options)[response]
    return options[key]
}

function simplePrint(expr) {
    console.log(
        expr
            .map(s => s[SIMPLE])
            .join('')
    )
}

function getLaTeX(expr) {
    return expr.map(s => s[LATEX]).join('')
}

function doAction(state, action) {
    // Push the symbol
    state.expr.push(action[SYMBOL](state))
    // Run the corresponding function
    action[FUNCTION](state)
    // Set the next term type
    state.type = action[NEXTTYPE]
    // Print the expression with simple symbols
    simplePrint(state.expr)
}

function init(state) {
    //Init by starting a group
    let action = types.Variable.Group
    doAction(state, action)
}

//Cartesian from https://stackoverflow.com/questions/12303989/cartesian-product-of-multiple-arrays-in-javascript
let g = (a, b) => [].concat(...a.map(a => b.map(b => [].concat(a, b))));
let cartesian = (a, b, ...c) => b ? cartesian(g(a, b), ...c) : a;

let vars = readline.question('Enter the free variables as single'
        + ' characters with no separation (e.g., "PQR"): ')
    .trim()     // Remove leading and trailing whitespace
    .split('')  // Put each character into its own index
let numvars = vars.length

const TEMPLATE = {
    vars:   vars,
    expr:   [],
    scope:  [],
    type:   'Variable'
}

let state = TEMPLATE
init(state)

do {
    // Prompt user to enter term
    let action = menu(state)
    doAction(state, action)
} while (state.scope.length > 0)

let args = _.product(...state.vars.map(o => [true, false]))
console.log(args)
let header = [...state.vars, state.expr.map(s => s[LATEX])]
console.log(header)
let body = args
        .map(a => [...a, state.result(a)])
console.log(body)

