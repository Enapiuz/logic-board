import {Basic, Port, PortMap} from "./basic";
import {CircuitError, Errors} from "./error";
import {logDeep} from "./utils";

export type ElementWithState = {
    element: Basic;
    inputState: PortMap;
    outputState: PortMap;
};

export type Connection = {
    srcName: string;
    srcOutput: Port;
    dstName: string;
    dstInput: Port;
};

export type IOPort = {
    elementName: string;
    elementPort: Port;
};

export type ElementOptions = {
    // Element will save output state between evaluations.
    preserveState: boolean;
};

const defaultOptions: ElementOptions = {
    preserveState: false,
};

export abstract class Element extends Basic {
    private elements: Map<string, ElementWithState> = new Map();
    private connections: Array<Connection> = [];

    private inputs: Map<Port, IOPort> = new Map();
    private outputs: Map<Port, IOPort> = new Map();

    constructor(protected options: ElementOptions = defaultOptions) {
        super();
        this.formBoard();
        // TODO: validate connections
    }

    protected addElement(name: string, element: Basic): void {
        this.elements.set(name, {
            element,
            inputState: new Map(),
            outputState: new Map(),
        });
    }

    protected addConnection(
        srcName: string,
        srcOutput: Port,
        dstName: string,
        dstInput: Port
    ): void {
        this.connections.push({srcName, srcOutput, dstName, dstInput});
    }

    protected addInput(
        externalPort: Port,
        elementName: string,
        elementPort: Port
    ): void {
        this.inputs.set(externalPort, {
            elementName,
            elementPort,
        });
    }

    protected addOutput(
        externalPort: Port,
        elementName: string,
        elementPort: Port
    ): void {
        this.outputs.set(externalPort, {
            elementName,
            elementPort,
        });
    }

    protected prefillValue(
        elementName: string,
        elementPort: Port,
        value: boolean
    ): void {
        (this.elements.get(elementName) as ElementWithState).inputState.set(
            elementPort,
            value
        );
    }

    // Where to create and connect all the elements
    protected abstract formBoard(): void;

    private resetState(): void {
        [...this.elements.keys()].forEach((elementName) => {
            (this.elements.get(elementName) as ElementWithState).inputState =
                new Map();
            (this.elements.get(elementName) as ElementWithState).outputState =
                new Map();
        });
    }

    public getInputPorts(): Port[] {
        return [...this.inputs.keys()];
    }

    public getOutputPorts(): Port[] {
        return [...this.outputs.keys()];
    }

    public eval(inputs: PortMap): PortMap {
        // reset state
        if (!this.options.preserveState) {
            this.resetState();
        }

        // init queue, such a complicated thing
        const q: string[] = [];

        // map to avoid enqueueing elements more than once
        const qmap = new Set<string>();

        // getting input elements
        // and initialising inputState of input elements
        [...this.inputs.keys()].forEach((inputPort) => {
            // inputPort - exact input Port which receives some value on board
            // ioPort.elementPort - port on element to assign input value to
            // ioPort.elementName - to which element assign input value
            const ioPort = this.inputs.get(inputPort) as IOPort;
            if (!inputs.has(inputPort)) {
                throw CircuitError.withCode(Errors.INPUT_DOES_NOT_EXIST);
            }
            const inputValue = inputs.get(inputPort) as boolean;
            const inputElement = this.elements.get(
                ioPort.elementName
            ) as ElementWithState;
            inputElement.inputState.set(ioPort.elementPort, inputValue);
            // enqueue input elements to calculate outputs
            q.push(ioPort.elementName);
            qmap.add(ioPort.elementName);
        });

        const queueReturners = new Map<string, number>();

        // kinda BFS on out graph of elements
        while (q.length > 0) {
            // calculate element's output state
            const elementName = q.shift() as string;
            const element = this.elements.get(elementName) as ElementWithState;

            // check if current element has enough input data
            const requiredInputSlots = element.element.getInputPorts().sort();
            const filledInputSlots = [...element.inputState.keys()].sort();
            // const filledInputSlots = Object.keys(element.inputState).map(Number).sort();
            if (requiredInputSlots.length !== filledInputSlots.length) {
                if (!queueReturners.has(elementName)) {
                    queueReturners.set(elementName, 1);
                }
                const totalReturns = queueReturners.get(elementName) as number;
                if (totalReturns > 99) {
                    logDeep(this.elements);
                    console.error(
                        `[${this.constructor.name}] ${elementName} looped ${totalReturns} times`
                    );
                    throw CircuitError.withCode(Errors.CYCLIC_CIRCUIT);
                }
                queueReturners.set(elementName, totalReturns + 1);
                q.push(elementName);
                continue;
            }
            let checkFailed = false;
            for (let i = 0; i < requiredInputSlots.length; i++) {
                if (requiredInputSlots[i] !== filledInputSlots[i]) {
                    q.push(elementName);
                    checkFailed = true;
                    break;
                }
            }
            if (checkFailed) {
                q.push(elementName);
                continue;
            }

            element.outputState = element.element.eval(element.inputState);

            // propagate element's output to its connections
            this.connections
                .filter(
                    (connection: Connection) =>
                        connection.srcName === elementName
                )
                .forEach((connection: Connection) => {
                    const dstElement = this.elements.get(
                        connection.dstName
                    ) as ElementWithState;
                    dstElement.inputState.set(
                        connection.dstInput,
                        element.outputState.get(connection.srcOutput) as boolean
                    );
                    // enqueue connections
                    if (!qmap.has(connection.dstName)) {
                        q.push(connection.dstName);
                        qmap.add(connection.dstName);
                    }
                });
        }

        const result: PortMap = new Map();
        // find output elements and return their state
        [...this.outputs.keys()].forEach((outputPort) => {
            // outputPort - name of the board's output
            const ioPort = this.outputs.get(outputPort) as IOPort;
            const element = this.elements.get(
                ioPort.elementName
            ) as ElementWithState;
            result.set(
                outputPort,
                element.outputState.get(ioPort.elementPort) as boolean
            );
        });

        // Should avoid computing same element twice in internal loop
        // But it's ok to eval entire block more than one in big circuits.
        qmap.clear();

        return result;
    }
}
