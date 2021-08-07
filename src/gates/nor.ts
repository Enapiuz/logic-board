import {Gate, TruthTable} from "../gate";

export class NOR extends Gate {
    protected readonly truthTable: TruthTable = [
        {in: [], out: new Map([[0, true]])},
        {in: [0], out: new Map([[0, false]])},
        {in: [1], out: new Map([[0, false]])},
        {in: [0, 1], out: new Map([[0, false]])},
    ];

    protected listInputs(): void {
        this.inputs.add(0);
        this.inputs.add(1);
    }

    protected listOutputs(): void {
        this.outputs.add(1);
    }
}
