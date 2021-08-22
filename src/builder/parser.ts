export class ChipDefinitionParser {
    public parse(input: string): ChipDefinition {
        const chip: ChipDefinition = {
            inputs: [],
            chips: [],
            connections: [],
            outputs: [],
            options: [],
        };

        input.split("\n").forEach((line) => {
            const {type, line: extractedLine} = this.divideTypeAndLine(line);
            switch (type) {
                case "IN": {
                    this.parseInputLine(extractedLine).forEach((res) => {
                        chip.inputs.push(res);
                    });
                    break;
                }
                case "CHIP": {
                    this.parseChipLine(extractedLine).forEach((res) => {
                        chip.chips.push(res);
                    });
                    break;
                }
                case "CONN": {
                    this.parseConnectionLine(extractedLine).forEach((res) => {
                        chip.connections.push(res);
                    });
                    break;
                }
                case "OUT": {
                    this.parseOutputLine(extractedLine).forEach((res) => {
                        chip.outputs.push(res);
                    });
                    break;
                }
                case "OPTION": {
                    chip.options.push(this.parseOptionLine(extractedLine));
                    break;
                }
                default: {
                    break;
                }
            }
        });

        return chip;
    }

    protected divideTypeAndLine(line: string): TypeAndLine {
        const res = {type: "", line: ""};
        try {
            const {
                groups: {type, rest},
            } = /(?<type>\w+)\:(?<rest>.*)/.exec(line) as any;
            res.type = type;
            res.line = rest;
        } catch (e) {} // for now just ignore it, meaningless line anyway
        return res;
    }

    protected parseInputLine(line: string): Input[] {
        const {
            groups: {name, amount},
        } = /(?<name>\w+)\s*\,\s*(?<amount>\d+)/.exec(line) as any;
        const result = [];
        for (let i = 0; i < amount; i++) {
            result.push({name: `${name}${i + 1}`});
        }
        return result;
    }

    protected parseChipLine(line: string): Chip[] {
        const res: Chip[] = [];
        const {
            groups: {internalName, chipName, amount},
        } = /(?<internalName>\w+)\s*\,\s*(?<chipName>\w+)\s*\,\s*(?<amount>\d+)/.exec(
            line
        ) as any;
        for (let i = 0; i < amount; i++) {
            res.push({
                internalName: `${internalName}${i + 1}`,
                elementName: chipName,
            });
        }
        return res;
    }

    protected parseConnectionLine(line: string): Connection[] {
        const reg =
            /(?<chip>[a-zA-Z0-9]+)\[(?<start>\d+)\.*(?<end>\d*)*\]\((?<pin>\d+)\)/;
        const [from, to] = line.split("->").map((item) => item.trim());
        const {
            groups: {chip: chipF, start: startF, end: endF, pin: pinF},
        } = reg.exec(from) as any;
        const {
            groups: {chip: chipT, start: startT, end: endT, pin: pinT},
        } = reg.exec(to) as any;

        const trueEndF = endF ?? startF;
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

        const res: Connection[] = [];
        for (let i = 0; i < realRange; i++) {
            const fromElemNum = fromList[i];
            const toElemNum = toList[i];
            res.push({
                sourceChipName: `${chipF}${fromElemNum}`,
                sourceChipPin: pinF,
                destChipName: `${chipT}${toElemNum}`,
                destChipPin: pinT,
            });
        }

        return res;
    }

    protected parseOutputLine(line: string): Output[] {
        const reg =
            /(?<chip>[a-zA-Z0-9]+)\[(?<start>\d+)\.*(?<end>\d*)*\]\((?<pin>\d+)\)/;
        const {
            groups: {chip, start, end, pin},
        } = reg.exec(line) as any;
        const trueEnd = end ?? start;
        const res: Output[] = [];
        for (let i = start; i <= trueEnd; i++) {
            res.push({
                internalChipName: `${chip}${i}`,
                chipPin: pin,
            });
        }
        return res;
    }

    protected parseOptionLine(line: string): Option {
        const {
            groups: {param, value},
        } = /(?<param>\w+)\s*\,\s*(?<value>true|false)/.exec(line) as any;
        return {name: param, value: value === "true" ? true : false};
    }
}

const prs = new ChipDefinitionParser();
const input = `
IN: Data, 16 # ololo
IN: WriteFlag, 1
CHIP: Cell, MemoryCell, 16 # asdasd
CHIP: Test, AND, 16 # adqweqwe
CONN: Data[1..16](0) -> Test[1..16](0) # for testing purposes
CONN: Data[1..16](0) -> Test[1..16](1) # asdasd
CONN: Data[1..16](0) -> Cell[1..16](0)
CONN: WriteFlag[1](0) -> Cell[1..16](1)
OUT: Cell[1..16](0) # qweqwe
OPTION: PreserveState, false
`;
const prsRes = prs.parse(input);
console.log(prsRes);

export type Input = {
    name: string;
};

export type Output = {
    internalChipName: string;
    chipPin: number;
};

export type Chip = {
    internalName: string;
    elementName: string;
};

export type Connection = {
    sourceChipName: string;
    sourceChipPin: number;
    destChipName: string;
    destChipPin: number;
};

export type Option = {
    name: string;
    value: boolean;
};

export type ChipDefinition = {
    inputs: Input[];
    outputs: Output[];
    chips: Chip[];
    connections: Connection[];
    options: Option[];
};

export type TypeAndLine = {
    type: string;
    line: string;
};
