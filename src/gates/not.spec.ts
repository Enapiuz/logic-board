import {Dataset} from "../../tests/types";
import {NOT} from "./not";

describe("AND", () => {
    const dataset: Dataset[] = [
        {
            input: [[0, false]],
            expect: [[0, true]],
        },
        {
            input: [[0, true]],
            expect: [[0, false]],
        },
    ];
    dataset.forEach((test) => {
        it("evals correctly", () => {
            const gate = new NOT();
            const res = gate.eval(new Map(test.input));
            expect(res).toEqual(new Map(test.expect));
        });
    });
});
