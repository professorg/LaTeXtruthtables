#!/bin/node
const readline = require('readline-sync')

// Operations
function startNegate(state) {
}

function getLiteral(state) {
}

function startGroup(state) {
    state.scope.unshift([])
}

function startAnd(state) {
}

function startOr(state) {
}

function startImplies(state) {
}

function endGroup(state) {
    state.scope.shift()
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
    Not:        state    => ['!',   '\\neg'],
    And:        state    => ['&',   '\\wedge'],
    Or:         state    => ['|',   '\\vee'],
    Implies:    state    => ['=>',  '\\to']
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
    let key = Object.keys(state.vars)[response]
    let symbol = state.vars[key]
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
    let action = types.Variable.Group
    doAction(state, action)
}

let vars = readline.question('Enter the free variables as single'
        + ' characters with no separation (e.g., "PQR"): ')
    .trim()     // Remove leading and trailing whitespace
    .split('')  // Put each character into its own index
let numvars = vars.length

const TEMPLATE = {
    vars:   vars,
    expr:   [],
    scope:  [],
    type:    'Variable'
}

let state = TEMPLATE
init(state)

do {
    // Prompt user to enter term
    let action = menu(state)
    doAction(state, action)
} while (state.scope.length > 0)

