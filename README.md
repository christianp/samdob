# [SAMDOB](https://www.checkmyworking.com/misc/samdob/)
A tool to play around with the order of operations.

## Why?

Pretty much everyone is taught a mnemonic for the order of arithmetic operations.

Some people are taught BODMAS, some are taught BIMDAS, while PEMDAS is popular in other parts of the world.

They describe the order in which you should carry out operations, but you need some more rules as well, that don't fit into a snappy mnemonic:

* Consider each operation in turn, reading the mnemonic from left to right.
* Read the expression from left to right. When you encounter the current operation, replace it with its numerical result.
* When you get to the end of the expression, go back to the start and move to the next operation in the mnemonic.

*Except* multiplication and division, and addition and subtraction, have the same precedence: you consider them both at the same time, rather than one after the other. The mnemonic doesn't mention this.

It's actually quite fiddly, but the fiddliness rarely makes a difference, if you've got common sense.

_What if you didn't have any common sense?_

## So

SAMDOB lets you see how the order of operations is applied. When you write an expression in the right-hand box, the steps taken to evaluate it to a number are shown underneath.

You can change the order of operations by writing a mnemonic in the left-hand box. Once you've done that, the sequence is described underneath.

Letters grouped in brackets have the same precedence.
