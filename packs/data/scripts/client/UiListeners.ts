import { broadcastEvent } from "../Common/Common";
import { CommonClientVariables } from "./CommonClientVariables";
import { indexUiOptions, blankScreenOptions, wallOffameOptions, confirmModalOptions, ui_suffix } from "../Const";
import { AbstractListener } from "../Common/AbstractListener";
import { refreshIndexScreen } from "./ClientTools";

export class UiListeners extends AbstractListener {

    constructor() {
        super();
        this.functions = {
            modStartedEvent() {
                broadcastEvent("minecraft:load_ui", indexUiOptions, CommonClientVariables.system);
            },

            modExitEvent() {
                broadcastEvent("minecraft:unload_ui", { path: "components/index/index" + ui_suffix + ".html" }, CommonClientVariables.system);
            },

            enterPlaceKeyframeModeEvent() {
                broadcastEvent("minecraft:unload_ui", { path: "components/index/index" + ui_suffix + ".html" }, CommonClientVariables.system);
                broadcastEvent("mcbestudio:enter_place_keyframe_mode", { id: CommonClientVariables.clientId }, CommonClientVariables.system);
            },

            generateSequenceEvent() {
                broadcastEvent("mcbestudio:generate_sequence", { id: CommonClientVariables.clientId }, CommonClientVariables.system);
            },

            deleteSequenceEvent() {
                broadcastEvent("mcbestudio:delete_sequence", { id: CommonClientVariables.clientId }, CommonClientVariables.system);
            },

            firstFrameEvent() {
                broadcastEvent("mcbestudio:go_to_first_frame", { id: CommonClientVariables.clientId }, CommonClientVariables.system);
            },

            lastFrameEvent() {
                broadcastEvent("mcbestudio:go_to_last_frame", { id: CommonClientVariables.clientId }, CommonClientVariables.system);
            },

            nextFrameEvent() {
                broadcastEvent("mcbestudio:go_to_next_frame", { id: CommonClientVariables.clientId }, CommonClientVariables.system);
            },

            previousFrameEvent() {
                broadcastEvent("mcbestudio:go_to_previous_frame", { id: CommonClientVariables.clientId }, CommonClientVariables.system);
            },

            indexUiOpenedEvent() {
                refreshIndexScreen();
                broadcastEvent("mcbestudio:go_to_first_frame", { id: CommonClientVariables.clientId }, CommonClientVariables.system);
            },

            playEvent() {
                broadcastEvent("mcbestudio:go_to_play", {
                    id: CommonClientVariables.clientId,
                    isFullScreen: false
                }, CommonClientVariables.system);
            },

            pauseEvent() {
                broadcastEvent("mcbestudio:go_to_pause", { id: CommonClientVariables.clientId }, CommonClientVariables.system);
            },

            playFullEvent() {
                broadcastEvent("minecraft:load_ui", blankScreenOptions, CommonClientVariables.system);
                broadcastEvent("mcbestudio:go_to_play", {
                    id: CommonClientVariables.clientId,
                    isFullScreen: true
                }, CommonClientVariables.system);
            },

            wallOfFameButtonEvent() {
                broadcastEvent("minecraft:load_ui", wallOffameOptions, CommonClientVariables.system);
            },

            backButtonWallOfFameEvent() {
                broadcastEvent("minecraft:unload_ui", { path: "components/wallOfFame/wallOfFame.html" }, CommonClientVariables.system);
            },

            progressBarOpenedEvent() {
                broadcastEvent("mcbestudio:progress_bar_opened", { id: CommonClientVariables.clientId }, CommonClientVariables.system);
            },

            moveKeyframeButtonEvent() {
                broadcastEvent("mcbestudio:move_keyframe", { id: CommonClientVariables.clientId }, CommonClientVariables.system);
            },

            deleteKeyframeButtonEvent() {
                broadcastEvent("mcbestudio:delete_keyframe", { id: CommonClientVariables.clientId }, CommonClientVariables.system);
            },
            deleteAllKeyframesButtonEvent() {
                broadcastEvent("minecraft:load_ui", confirmModalOptions, CommonClientVariables.system);
            },
            cutButtonEvent() {
                broadcastEvent("mcbestudio:cut_sequence", { id: CommonClientVariables.clientId }, CommonClientVariables.system);
            },
            switchToEditModeEvent() {
                CommonClientVariables.clientMode = "edit";
            },
            switchToReadModeEvent() {
                CommonClientVariables.clientMode = "read";

            },
            yesButtonEvent() {
                broadcastEvent("minecraft:unload_ui", { path: "components/confirmModal/confirmModal.html" }, CommonClientVariables.system);
                broadcastEvent("mcbestudio:delete_all_keyframes", { id: CommonClientVariables.clientId }, CommonClientVariables.system);
                CommonClientVariables.frameNumber = 0;
                broadcastEvent("minecraft:send_ui_event", {
                    eventIdentifier: "mcbestudio:all_keyframes_deleted",
                    data: ""
                }, CommonClientVariables.system);
            },
            noButtonEvent() {
                broadcastEvent("minecraft:unload_ui", { path: "components/confirmModal/confirmModal.html" }, CommonClientVariables.system);
            },
        };
    }

}