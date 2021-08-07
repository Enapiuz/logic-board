import {Gate, TruthTable} from "../gate";

// Crutch to pass input to multiple other elements
export class NOT extends Gate {
    protected readonly truthTable: TruthTable = [
        {in: [], out: new Map([[0, true]])},
        {in: [0], out: new Map([[0, false]])},
    ];

    protected listInputs(): void {
        this.inputs.add(0);
    }

    protected listOutputs(): void {
        this.outputs.add(0);
    }
}
