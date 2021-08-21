export enum Errors {
    WRONG_INPUT,
    INVALID_TRUTH_TABLE,
    CYCLIC_CIRCUIT,
    INPUT_DOES_NOT_EXIST,
    CANT_LOAD_CHIP,
    CHANGING_ELEMENT_AFTER_FIRST_EVAL_NOT_ALLOWED,
}

export class CircuitError extends Error {
    protected code: Errors;

    protected constructor(code: Errors) {
        super();
        this.code = code;
    }

    public static withCode(code: Errors): CircuitError {
        return new CircuitError(code);
    }
}
