import {MemoryCell} from "./memory_cell";

describe("MemoryCell", () => {
    it("outputs zero by default", () => {
        const cell = new MemoryCell();
        const res = cell.eval(
            new Map([
                [0, false],
                [1, false],
            ])
        );
        expect(res.get(0)).toBe(false);
    });

    const writeFlagDataset = [false, true];
    writeFlagDataset.forEach((flag) => {
        it(`doesn't change state with zero write flag, input: ${flag}`, () => {
            const cell = new MemoryCell();
            const res = cell.eval(
                new Map([
                    [0, flag],
                    [1, false], // writeFLag always zero
                ])
            );
            expect(res.get(0)).toBe(false);
        });
    });

    it("changes state with write flag 1", () => {
        const cell = new MemoryCell();
        const res = cell.eval(
            new Map([
                [0, true],
                [1, true],
            ])
        );
        expect(res.get(0)).toBe(true);
    });

    it("saves state between calls", () => {
        const cell = new MemoryCell();
        let res = cell.eval(
            new Map([
                [0, true],
                [1, true],
            ])
        );
        expect(res.get(0)).toBe(true);
        res = cell.eval(
            new Map([
                [0, false],
                [1, false],
            ])
        );
        expect(res.get(0)).toBe(true);
    });
});
