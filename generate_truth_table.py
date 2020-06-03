#!/bin/python3

symbolTrue = "T"
symbolFalse = "F"

def func_P(P, Q, R):
    return P

def func_Q(P, Q, R):
    return Q

def func_R(P, Q, R):
    return R

def implies(P, Q):
    return Q or not P

def func_before(P, Q, R):
    return not (implies(not P, not Q) and implies(not Q, R))

def func_after(P, Q, R):
    return (Q and not P) or (not R and not Q)

def to_symbol(val):
    if val:
        return symbolTrue
    else:
        return symbolFalse

header = ["P", "Q", "R", "\\neg ((\\neg P \\to \\neg Q) \\wedge (\\neg Q \\to R))", "(Q \\wedge \\neg P) \\vee (R \\wedge \\neg Q)"]
body = [func_P, func_Q, func_R, func_before, func_after]
separator = " & "
endl = " \\\\"

print(separator.join(header) + endl + " \\hline")

for i in range(0b1000):
    P = int((i % 0b1000) / 0b100) == 0
    Q = int((i % 0b100) / 0b10) == 0
    R = int((i % 0b10) / 0b1) == 0
    print(separator.join(map(lambda f: to_symbol(f(P,Q,R)), body)) + endl)

