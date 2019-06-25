import { CurrentClient } from "./CurrentClient";
import { CustomConsole } from "../Utils/CustomConsole";
import { ServerTimeline } from "./ServerTimeline";

export class CommonServerVariables {
    public static connectedClientsdata: Array<CurrentClient>;
    public static console: CustomConsole;
    public static serverTimeline: ServerTimeline;
    public static system: IVanillaServerSystem;
}