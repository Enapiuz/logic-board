import {Dataset} from "../test-types";
import {XOR} from "./xor";

describe("AND", () => {
    const dataset: Dataset[] = [
        {
            input: [
                [0, false],
                [1, false],
            ],
            expect: [[0, false]],
        },
        {
            input: [
                [0, true],
                [1, false],
            ],
            expect: [[0, true]],
        },
        {
            input: [
                [0, false],
                [1, true],
            ],
            expect: [[0, true]],
        },
        {
            input: [
                [0, true],
                [1, true],
            ],
            expect: [[0, false]],
        },
    ];
    dataset.forEach((test) => {
        it("evals correctly", () => {
            const gate = new XOR();
            const res = gate.eval(new Map(test.input));
            expect(res).toEqual(new Map(test.expect));
        });
    });
});
