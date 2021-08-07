import {Dataset} from "../../tests/types";
import {BUF} from "./buf";

describe("AND", () => {
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
        it("evals correctly", () => {
            const gate = new BUF();
            const res = gate.eval(new Map(test.input));
            expect(res).toEqual(new Map(test.expect));
        });
    });
});
