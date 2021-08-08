import {Element} from "./element";
import {BUF} from "./gates/buf";
import {Dataset} from "./test-types";

describe("Element", () => {
    // Basic test that it just works
    class BufElem extends Element {
        formBoard() {
            this.addElement("buf", new BUF());
            this.addInput(0, "buf", 0);
            this.addOutput(0, "buf", 0);
        }
    }
    const dataset: Dataset[] = [
        {
            input: [[0, false]],
            expect: [[0, false]],
        },
        {
            input: [[0, true]],
            expect: [[0, true]],
        },
    ];
    dataset.forEach((test) => {
        it("works with just BUF", () => {
            const elem = new BufElem();
            const res = elem.eval(new Map(test.input));
            expect(res).toEqual(new Map(test.expect));
        });
    });
});
