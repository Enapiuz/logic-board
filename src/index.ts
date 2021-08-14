import {MemoryCell} from "./complex/memory_cell";
import {AND} from "./gates/and";
import {BUF} from "./gates/buf";
import {NAND} from "./gates/nand";
import {NOR} from "./gates/nor";
import {NOT} from "./gates/not";
import {OR} from "./gates/or";
import {XNOR} from "./gates/xnor";
import {XOR} from "./gates/xor";

export {Basic, Port, PortMap} from "./basic";
export {Element} from "./element";
export {Errors} from "./error";

export const gate = {
    AND: () => new AND(),
    BUF: () => new BUF(),
    NAND: () => new NAND(),
    NOR: () => new NOR(),
    NOT: () => new NOT(),
    OR: () => new OR(),
    XNOR: () => new XNOR(),
    XOR: () => new XOR(),
};

export const complex = {
    MemoryCell: () => new MemoryCell(),
};
