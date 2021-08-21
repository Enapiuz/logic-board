import path from "path";
import {ChipBuilder} from ".";

describe("Chip Builder", () => {
    it("Loads data from given file", () => {
        const builder = new ChipBuilder(path.resolve(__dirname, "examples"));
        const chip = builder.buildFromFile("MemoryRow.elem");
    });
});
