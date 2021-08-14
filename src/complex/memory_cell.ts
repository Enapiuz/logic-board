import {Basic, Port, PortMap} from "../basic";

/**
 * Not fair implementation of memory cell.
 * Because now I'm too lazy to implement it properly
 * via logic gates.
 * Shall refactor that lated (maybe never, to whom I lie?).
 */
export class MemoryCell extends Basic {
    private state: boolean = false;

    public getInputPorts(): Port[] {
        return [0, 1];
    }
    public getOutputPorts(): Port[] {
        return [0];
    }

    /**
     * 0 - input
     * 1 - write flag
     */
    public eval(inputs: PortMap): PortMap {
        const input = inputs.get(0) as boolean;
        const writeFlag = inputs.get(1) as boolean;
        const result: PortMap = new Map<number, boolean>();
        if (writeFlag) {
            result.set(0, input);
            this.state = input;
        } else {
            result.set(0, this.state);
        }
        return result;
    }
}
