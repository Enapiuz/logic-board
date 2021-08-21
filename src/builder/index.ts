import fs from "fs";
import yaml from "js-yaml";
import path from "path";
import {gate} from "..";
import {Basic} from "../basic";
import {MemoryCell} from "../complex/memory_cell";
import {Element, ConstructableElement} from "../element";
import {CircuitError, Errors} from "../error";
import {AND} from "../gates/and";
import {BUF} from "../gates/buf";
import {NAND} from "../gates/nand";
import {NOR} from "../gates/nor";
import {NOT} from "../gates/not";
import {OR} from "../gates/or";
import {XNOR} from "../gates/xnor";
import {XOR} from "../gates/xor";

export type ElementCreator = () => Basic;

const knownElements = new Map<string, ElementCreator>();

export class ChipBuilder {
    constructor(protected lookupPath: string) {
        this.loadBasicElements();
        this.loadComplexElements();
    }

    public buildFromFile(filename: string): Element {
        let currentInputPort = 0;
        let currentOutputPort = 0;

        const data = fs
            .readFileSync(path.resolve(filename), "utf-8")
            .replace(/\s*\-\>/g, ":");
        const obj: Chip = yaml.load(data) as Chip;

        // 1. Loading all found references
        Object.entries(obj.Elements).forEach(([block, data]) => {
            const elementRef = (data.match(/[a-zA-Z0-9]+/) || [])[0];
            if (!knownElements.has(elementRef)) {
                const refFilename = path.resolve(
                    this.lookupPath,
                    `${elementRef}.elem`
                );
                knownElements.set(elementRef, () =>
                    this.buildFromFile(refFilename)
                );
            }
        });
        // Find and load all references if necessary
        const element = new ConstructableElement();
        Object.entries(obj.Elements || {}).forEach(
            ([namePrefix, componentAndAmount]) => {
                // Parse exact component name and needed amount
                const res = /(.+)\[([0-9]+)\]/.exec(componentAndAmount);
                if (res == null) {
                    throw CircuitError.withCode(Errors.CANT_LOAD_CHIP);
                }
                const elemName = res[1];
                const elemCount = Number(res[2]);
                for (let i = 1; i <= elemCount; i++) {
                    element.addElement(
                        `${namePrefix}${i}`,
                        // TODO: check if exists
                        (knownElements.get(elemName) as ElementCreator)()
                    );
                }
            }
        );

        // Add inputs (create bufs for them and connect immediately)
        Object.entries(obj.Inputs || {}).forEach(([namePrefix, amount]) => {
            for (let i = 1; i <= amount; i++) {
                element.addElement(`${namePrefix}${i}`, gate.BUF());
                element.addInput(currentInputPort, `${namePrefix}${i}`, 0);
                currentInputPort++;
            }
        });

        // Add outputs
        Object.entries(obj.Outputs || {}).forEach(
            ([elementAndAmount, elementPort]) => {
                // parse elem range
                const {
                    groups: {chip, start, end},
                } = /(?<chip>[a-zA-Z0-9]+)\[(?<start>\d+)\.*(?<end>\d*)*\]/.exec(
                    elementAndAmount
                ) as any;

                const trueEnd = end ?? start;
                for (let i = start; i <= trueEnd; i++) {
                    element.addOutput(
                        currentOutputPort,
                        `${chip}${i}`,
                        elementPort
                    );
                    currentOutputPort++;
                }
            }
        );

        // Add connections (for inputs connect with bufs)
        Object.entries(obj.Connections || {}).forEach(([from, to]) => {
            const reg =
                /(?<chip>[a-zA-Z0-9]+)\[(?<start>\d+)\.*(?<end>\d*)*\]\((?<pin>\d+)\)/;

            const {
                groups: {chip: chipF, start: startF, end: endF, pin: pinF},
            } = reg.exec(from) as any;
            let trueEndF = endF ?? startF;

            const {
                groups: {chip: chipT, start: startT, end: endT, pin: pinT},
            } = reg.exec(to) as any;

            const trueEndT = endT ?? startT;
            const startRange = trueEndF - startF + 1;
            const endRange = trueEndT - startT + 1;
            const realRange = startRange > endRange ? startRange : endRange;

            const filler = (
                start: number,
                to: number,
                length: number
            ): number[] => {
                let currNum = start;
                const result: number[] = [];
                for (let i = 0; i < length; i++) {
                    result.push(Number(currNum));
                    if (start < to) {
                        currNum++;
                    }
                }
                return result;
            };
            const fromList = filler(startF, endF, realRange);
            const toList = filler(startT, endT, realRange);

            for (let i = 0; i < realRange; i++) {
                const fromElemNum = fromList[i];
                const toElemNum = toList[i];
                element.addConnection(
                    `${chipF}${fromElemNum}`,
                    pinF,
                    `${chipT}${toElemNum}`,
                    pinT
                );
            }
        });

        // Add prefills
        Object.entries(obj.Prefills || {}).forEach(
            ([elementsAndPort, value]) => {
                console.log([elementsAndPort, value]);
                const reg =
                    /(?<chip>[a-zA-Z0-9]+)\[(?<start>\d+)\.*(?<end>\d*)*\]\((?<pin>\d+)\)/;
                const {
                    groups: {chip, start, end, pin},
                } = reg.exec(elementsAndPort) as any;
                const realEnd = end ?? start;
                for (let i = start; i <= realEnd; i++) {
                    element.prefillValue(`${chip}${i}`, pin, value);
                }
            }
        );

        // console.log(element);
        return element;
    }

    protected loadBasicElements() {
        knownElements.set("AND", () => new AND());
        knownElements.set("BUF", () => new BUF());
        knownElements.set("NAND", () => new NAND());
        knownElements.set("NOR", () => new NOR());
        knownElements.set("NOT", () => new NOT());
        knownElements.set("OR", () => new OR());
        knownElements.set("XNOR", () => new XNOR());
        knownElements.set("XOR", () => new XOR());
    }

    protected loadComplexElements() {
        knownElements.set("MemoryCell", () => new MemoryCell());
    }
}

export type Chip = {
    Options: {
        PreserveState?: boolean;
    };
    Inputs: {
        [key: string]: number;
    };
    Elements: {
        [key: string]: string;
    };
    Connections: {
        [key: string]: string;
    };
    Outputs: {
        [key: string]: number;
    };
    Prefills: {
        [key: string]: boolean;
    };
};
