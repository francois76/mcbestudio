import { broadcastEvent, refreshIndexScreen } from "../Utils/Common";
import { CommonClientVariables } from "./CommonClientVariables";
import { indexUiOptions, blankScreenOptions, wallOffameOptions, confirmModalOptions, ui_suffix } from "../Const";

export class UiListeners {


    onModStarted() {
        broadcastEvent("minecraft:load_ui", indexUiOptions, CommonClientVariables.system);
    };

    onModExit() {
        broadcastEvent("minecraft:unload_ui", { path: "components/index/index" + ui_suffix + ".html" }, CommonClientVariables.system);
    };

    onEnterPlaceKeyframeMode() {
        broadcastEvent("minecraft:unload_ui", { path: "components/index/index" + ui_suffix + ".html" }, CommonClientVariables.system);
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
        refreshIndexScreen();
        broadcastEvent("mcbestudio:go_to_first_frame", { id: CommonClientVariables.clientId }, CommonClientVariables.system);
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
        broadcastEvent("minecraft:unload_ui", { path: "components/wallOfFame/wallOfFame.html" }, CommonClientVariables.system);
    }

    progressBarOpened() {
        broadcastEvent("mcbestudio:progress_bar_opened", { id: CommonClientVariables.clientId }, CommonClientVariables.system);
    }

    goToMoveKeyframe() {
        broadcastEvent("mcbestudio:move_keyframe", { id: CommonClientVariables.clientId }, CommonClientVariables.system);
    }

    goToDeleteKeyframe() {
        broadcastEvent("mcbestudio:delete_keyframe", { id: CommonClientVariables.clientId }, CommonClientVariables.system);
    }
    goToDeleteAllKeyframes() {
        broadcastEvent("minecraft:load_ui", confirmModalOptions, CommonClientVariables.system);
    }
    goToCut() {
        broadcastEvent("mcbestudio:cut_sequence", { id: CommonClientVariables.clientId }, CommonClientVariables.system);
    }
    switchToEditMode() {
        CommonClientVariables.clientMode = "edit";
    }
    switchToReadMode() {
        CommonClientVariables.clientMode = "read";

    }
    goToYesButton() {
        broadcastEvent("minecraft:unload_ui", { path: "components/confirmModal/confirmModal.html" }, CommonClientVariables.system);
        broadcastEvent("mcbestudio:delete_all_keyframes", { id: CommonClientVariables.clientId }, CommonClientVariables.system);
        CommonClientVariables.frameNumber = 0;
        broadcastEvent("minecraft:send_ui_event", {
            eventIdentifier: "mcbestudio:all_keyframes_deleted",
            data: ""
        }, CommonClientVariables.system);
    }
    goToNoButton() {
        broadcastEvent("minecraft:unload_ui", { path: "components/confirmModal/confirmModal.html" }, CommonClientVariables.system);
    }
}