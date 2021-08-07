import {Basic, Port, PortMap} from "./basic";
import {CircuitError, Errors} from "./error";

export type TruthRow = {
    in: Port[];
    out: PortMap;
};

export type TruthTable = Array<TruthRow>;

export abstract class Gate extends Basic {
    /**
     * Example AND:
     * [
     *  {in: [], out: false},
     *  {in: [0], out: false},
     *  {in: [1], out: false},
     *  {in: [0, 1], out: false}
     * ]
     *
     * @protected
     */
    protected abstract readonly truthTable: TruthTable;

    protected inputs: Set<Port> = new Set();
    protected outputs: Set<Port> = new Set();

    constructor() {
        super();
        this.listInputs();
        this.listOutputs();
        // TODO: validate truth table
    }

    protected abstract listInputs(): void;
    protected abstract listOutputs(): void;

    public getInputPorts(): Port[] {
        return [...this.inputs.values()];
    }

    public getOutputPorts(): Port[] {
        return [...this.outputs.values()];
    }

    protected isPortSame(one: Port[], two: Port[]): boolean {
        if (one.length !== two.length) {
            return false;
        }
        const oneValues = [...one.values()];
        const twoValues = [...two.values()];
        for (let i = 0; i < one.length; i++) {
            if (oneValues[i] !== twoValues[i]) {
                return false;
            }
        }
        return true;
    }

    public eval(inputs: PortMap): PortMap {
        // TODO: validate inputs
        const positiveInputKeys = [...inputs.keys()]
            .filter((key) => inputs.get(key))
            .sort();
        const filtered = this.truthTable.filter((row) =>
            this.isPortSame(row.in, positiveInputKeys)
        );
        if (filtered.length === 0) {
            throw CircuitError.withCode(Errors.WRONG_INPUT);
        }
        if (filtered.length > 1) {
            throw CircuitError.withCode(Errors.INVALID_TRUTH_TABLE);
        }
        return filtered[0].out;
    }
}
