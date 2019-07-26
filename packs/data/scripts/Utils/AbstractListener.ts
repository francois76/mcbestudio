import { CommonClientVariables } from "../client/CommonClientVariables";
import { CommonServerVariables } from "../server/CommonServerVariables";

export class AbstractListener {


    callFunction(functionName: string, params: Array<any>) {
        if (this.functions[functionName]) {
            this.functions[functionName].apply(this, params);
        } else if (CommonClientVariables.console) {
            CommonClientVariables.console.log("Client error : " + functionName);
        } else {
            CommonServerVariables.console.log("Server error : " + functionName);
        }
    }

    protected functions: any;
}