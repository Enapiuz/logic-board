export type PortState = [number, boolean];

export type Dataset = {
    input: PortState[];
    expect: PortState[];
};
