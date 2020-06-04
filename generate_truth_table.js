#!/bin/node
const readline = require('readline-sync');

const symbolTrue = 'T';
const symbolFalse = 'F';

let response = readline.question('Enter the free variables as single'
        + 'characters with no separation (e.g., "PQR"): ')
console.log(response);

