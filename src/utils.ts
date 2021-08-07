import * as util from "util";

export function logDeep(input: any): void {
    console.log(util.inspect(input, false, null, true));
}
