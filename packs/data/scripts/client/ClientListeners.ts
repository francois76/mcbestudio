import { broadcastEvent, refreshIndexScreen } from "../Utils/Common";
import { initUiOptions, indexUiOptions, progressBarOptions } from "../Const";
import { CommonClientVariables } from "./CommonClientVariables";
import { UiListeners } from "./UiListeners";
import { CurrentClient } from "../server/CurrentClient";
import { AbstractListener } from "../Utils/AbstractListener";

export class ClientListeners extends AbstractListener {

    constructor() {
        super();
        this.functions = {
            clientEnteredWorld(player: IEntity) {
                CommonClientVariables.clientId = player.id;
                broadcastEvent('mcbestudio:client_entered_world', { player: player }, CommonClientVariables.system);
                broadcastEvent('minecraft:load_ui', initUiOptions, CommonClientVariables.system);
            },
            exitPlaceKeyframeMode() {
                broadcastEvent('minecraft:load_ui', indexUiOptions, CommonClientVariables.system);
            },
            updateFrameNumber(frameNumber: number) {
                CommonClientVariables.frameNumber = frameNumber;
                refreshIndexScreen();
            },
            openModal() {
                broadcastEvent('minecraft:load_ui', progressBarOptions, CommonClientVariables.system);
            },
            closeModal() {
                broadcastEvent("minecraft:unload_ui", { path: "components/progressBar/progressBar.html" }, CommonClientVariables.system);
            },
            updateModalValue(currentState: number) {
                broadcastEvent("minecraft:send_ui_event", {
                    eventIdentifier: "mcbestudio:update_modal_value",
                    data: currentState
                }, CommonClientVariables.system);
            },
            leaveFullScreen() {
                broadcastEvent("minecraft:unload_ui", { path: "components/blank/blank.html" }, CommonClientVariables.system);
            },
            notifySequenceEnded() {
                broadcastEvent("minecraft:send_ui_event", { eventIdentifier: "mcbestudio:switch_play_to_pause", data: null }, CommonClientVariables.system);
            },
            notifyCurrentFrame(currentFrame: number) {
                broadcastEvent("minecraft:send_ui_event", {
                    eventIdentifier: "mcbestudio:notify_current_frame",
                    data: currentFrame
                }, CommonClientVariables.system);
            },
            uiEvent(data: string) {
                const uiListeners: UiListeners = new UiListeners();
                uiListeners.callFunction(data + "Event", null);
            }

        }
    }
}