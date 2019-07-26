import { broadcastEvent } from "../Common/Common";
import { CommonClientVariables } from "./CommonClientVariables";

export function refreshIndexScreen() {
    broadcastEvent("minecraft:send_ui_event", {
        eventIdentifier: "mcbestudio:update_frame_number_ui",
        data: CommonClientVariables.frameNumber
    }, CommonClientVariables.system);
    broadcastEvent("minecraft:send_ui_event", {
        eventIdentifier: "mcbestudio:notify_current_mode",
        data: CommonClientVariables.clientMode
    }, CommonClientVariables.system);
}