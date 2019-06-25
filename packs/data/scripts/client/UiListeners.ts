import { broadcastEvent } from "../Utils/Common";
import { CommonClientVariables } from "./CommonClientVariables";
import { indexUiOptions, blankScreenOptions, wallOffameOptions } from "../Const";

export class UiListeners {


    onModStarted() {
        broadcastEvent("minecraft:load_ui", indexUiOptions, CommonClientVariables.system);
    };

    onModExit() {
        broadcastEvent("minecraft:unload_ui", { path: "index.html" }, CommonClientVariables.system);
    };

    onEnterPlaceKeyframeMode() {
        broadcastEvent("minecraft:unload_ui", { path: "index.html" }, CommonClientVariables.system);
        broadcastEvent("mcbestudio:enter_place_keyframe_mode", { id: CommonClientVariables.clientId }, CommonClientVariables.system);
    };

    onSequenceGeneration() {
        broadcastEvent("mcbestudio:generate_sequence", { id: CommonClientVariables.clientId }, CommonClientVariables.system);
    }

    onDeleteSequence() {
        broadcastEvent("mcbestudio:delete_sequence", { id: CommonClientVariables.clientId }, CommonClientVariables.system);
    }

    goToFirstFrame() {
        broadcastEvent("mcbestudio:go_to_first_frame", { id: CommonClientVariables.clientId }, CommonClientVariables.system);
    }

    goToLastFrame() {
        broadcastEvent("mcbestudio:go_to_last_frame", { id: CommonClientVariables.clientId }, CommonClientVariables.system);
    }

    goToNextFrame() {
        broadcastEvent("mcbestudio:go_to_next_frame", { id: CommonClientVariables.clientId }, CommonClientVariables.system);
    }

    goToPreviousFrame() {
        broadcastEvent("mcbestudio:go_to_previous_frame", { id: CommonClientVariables.clientId }, CommonClientVariables.system);
    }

    indexUiOpened() {
        broadcastEvent("minecraft:send_ui_event", {
            eventIdentifier: "mcbestudio:update_frame_number_ui",
            data: CommonClientVariables.frameNumber
        }, CommonClientVariables.system);
    }

    goToPlay() {
        broadcastEvent("mcbestudio:go_to_play", {
            id: CommonClientVariables.clientId,
            isFullScreen: false
        }, CommonClientVariables.system);
    }

    goToPause() {
        broadcastEvent("mcbestudio:go_to_pause", { id: CommonClientVariables.clientId }, CommonClientVariables.system);
    }

    goToPlayFull() {
        broadcastEvent("minecraft:load_ui", blankScreenOptions, CommonClientVariables.system);
        broadcastEvent("mcbestudio:go_to_play", {
            id: CommonClientVariables.clientId,
            isFullScreen: true
        }, CommonClientVariables.system);
    }

    goToWallOfFame() {
        broadcastEvent("minecraft:load_ui", wallOffameOptions, CommonClientVariables.system);
    }

    goToBackButtonWallOfFame() {
        broadcastEvent("minecraft:unload_ui", { path: "wallOfFame.html" }, CommonClientVariables.system);
    }

    progressBarOpened() {
        broadcastEvent("mcbestudio:progress_bar_opened", { id: CommonClientVariables.clientId }, CommonClientVariables.system);
    }
}