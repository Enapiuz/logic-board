# Logic Board

Logic circuit simulator

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]

## Installation

`npm install logic-board`

## Usage

Simple half-adder example

```js
import {Element, AND, XOR, BUF} from "logic-board";

/**
 * Input ports: 0 and 1.
 * Output ports: 0 as summ, 1 as carry.
 */
export class HalfAdder extends Element {
    protected formBoard() {
        this.addElement("input1", new BUF());
        this.addElement("input2", new BUF());
        this.addElement("and1", new AND());
        this.addElement("xor1", new XOR());
        this.addConnection("input1", 0, "and1", 0);
        this.addConnection("input1", 0, "xor1", 0);
        this.addConnection("input2", 0, "and1", 1);
        this.addConnection("input2", 0, "xor1", 1);
        this.addInput(0, "input1", 0); // input 0
        this.addInput(1, "input2", 0); // input 1
        this.addOutput(0, "xor1", 0); // sum
        this.addOutput(1, "and1", 0); // carry
    }
}

const ha = new HalfAdder();
const result = ha.eval(new Map([[0, false], [1, true]]));

// result = Map([[0, true], [1, false]])
```

Full adder example (using half-adder from previous example):

```js
import {Element, BUF, OR} from "logic-board";
import {HalfAdder} from "./half_adder";

export class Adder extends Element {
    protected formBoard(): void {
        // all needed elements
        this.addElement("A", new BUF());
        this.addElement("B", new BUF());
        this.addElement("carryIn", new BUF());
        this.addElement("ha0", new HalfAdder());
        this.addElement("ha1", new HalfAdder());
        this.addElement("or0", new OR());

        // connect external inputs
        this.addInput(0, "A", 0);
        this.addInput(1, "B", 0);
        this.addInput(2, "carryIn", 0);

        // connect internal inputs
        this.addConnection("A", 0, "ha0", 0);
        this.addConnection("B", 0, "ha0", 1);
        this.addConnection("carryIn", 0, "ha1", 0);

        // connect elements
        this.addConnection("ha0", 0, "ha1", 1);
        this.addConnection("ha0", 1, "or0", 1);
        this.addConnection("ha1", 1, "or0", 0);

        // define outputs
        this.addOutput(0, "ha1", 0); // sum
        this.addOutput(1, "or0", 0); // carry out
    }
}
```

## License

[MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/logic-board.svg
[npm-url]: https://npmjs.org/package/logic-board
[downloads-image]: https://img.shields.io/npm/dm/logic-board.svg
[downloads-url]: https://npmcharts.com/compare/logic-board?minimal=true
