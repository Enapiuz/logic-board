export type Port = number;

export type PortMap = Map<Port, boolean>;

export abstract class Basic {
    // For automatic input validation purposes
    public abstract getInputPorts(): Port[];

    // For automatic output validation purposes
    public abstract getOutputPorts(): Port[];

    // Place something in, get something out
    public abstract eval(inputs: PortMap): PortMap;
}
