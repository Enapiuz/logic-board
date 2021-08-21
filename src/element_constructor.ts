import {Basic, Port, PortMap} from "./basic";
import {Element} from "./element";

// Class to construct elements in Builder.
export class ElementConstructor extends Element {
    protected formBoard() {}

    public addElement(name: string, element: Basic): void {
        super.addElement(name, element);
    }

    public addConnection(
        srcName: string,
        srcOutput: Port,
        dstName: string,
        dstInput: Port
    ): void {
        super.addConnection(srcName, srcOutput, dstName, dstInput);
    }

    public addInput(
        externalPort: Port,
        elementName: string,
        elementPort: Port
    ): void {
        super.addInput(externalPort, elementName, elementPort);
    }

    public addOutput(
        externalPort: Port,
        elementName: string,
        elementPort: Port
    ): void {
        super.addOutput(externalPort, elementName, elementPort);
    }

    public prefillValue(
        elementName: string,
        elementPort: Port,
        value: boolean
    ): void {
        super.prefillValue(elementName, elementPort, value);
    }

    protected _eval(inputs: PortMap): PortMap {
        return super.eval(inputs);
    }

    public eval(inputs: PortMap): PortMap {
        const errf = () => {
            throw new Error("OLOLO NOT ALLOWED");
        };
        errf.bind(this);
        this.addConnection = errf;
        this.addElement = errf;
        this.addInput = errf;
        this.addOutput = errf;
        this.eval = this._eval;
        return super.eval(inputs);
    }
}
