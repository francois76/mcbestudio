import { broadcastEvent } from "../Utils/Common";
import { initUiOptions, indexUiOptions, progressBarOptions } from "../Const";
import { CommonClientVariables } from "./CommonClientVariables";
import { UiListeners } from "./UiListeners";
import { CurrentClient } from "../server/CurrentClient";

export class ClientListeners {

    constructor(private _clientSystem: IVanillaClientSystem) {
    }

    callFunction(functionName: string, params: Array<any>) {
        this.functions[functionName].apply(this, params);
    }

    private functions: any = {
        clientEnteredWorld(player: IEntity) {
            CommonClientVariables.clientId = player.id;
            broadcastEvent('mcbestudio:client_entered_world', { player: player }, this._clientSystem);
            broadcastEvent('minecraft:load_ui', initUiOptions, this._clientSystem);
        },
        exitPlaceKeyframeMode() {
            broadcastEvent('minecraft:load_ui', indexUiOptions, this._clientSystem);
        },
        updateFrameNumber(frameNumber: number) {
            CommonClientVariables.frameNumber = frameNumber;
            const uiListeners: UiListeners = new UiListeners();
            uiListeners.indexUiOpened();
        },
        openModal() {
            broadcastEvent('minecraft:load_ui', progressBarOptions, this._clientSystem);
        },
        closeModal() {
            broadcastEvent("minecraft:unload_ui", { path: "components/progressBar/progressBar.html" }, this._clientSystem);
        },
        updateModalValue(currentState: number) {
            broadcastEvent("minecraft:send_ui_event", {
                eventIdentifier: "mcbestudio:update_modal_value",
                data: currentState
            }, this._clientSystem);
        },
        leaveFullScreen() {
            broadcastEvent("minecraft:unload_ui", { path: "components/blank/blank.html" }, this._clientSystem);
        },
        notifySequenceEnded() {
            broadcastEvent("minecraft:send_ui_event", { eventIdentifier: "mcbestudio:switch_play_to_pause", data: null }, this._clientSystem);
        },
        notifyCurrentFrame(currentFrame: number) {
            broadcastEvent("minecraft:send_ui_event", {
                eventIdentifier: "mcbestudio:notify_current_frame",
                data: currentFrame
            }, this._clientSystem);
        },
        uiEvent(data: string) {
            const uiListeners: UiListeners = new UiListeners();
            if (data === "modStarted") {
                uiListeners.onModStarted();
            } else if (data === "modExit") {
                uiListeners.onModExit();
            } else if (data === "enterPlaceKeyframeMode") {
                uiListeners.onEnterPlaceKeyframeMode();
            } else if (data === "generateSequence") {
                uiListeners.onSequenceGeneration();
            } else if (data === "firstFrame") {
                uiListeners.goToFirstFrame();
            } else if (data === "previousFrame") {
                uiListeners.goToPreviousFrame();
            } else if (data === "nextFrame") {
                uiListeners.goToNextFrame();
            } else if (data === "lastFrame") {
                uiListeners.goToLastFrame();
            } else if (data === "indexUiOpened") {
                uiListeners.indexUiOpened();
            } else if (data === "play") {
                uiListeners.goToPlay();
            } else if (data === "pause") {
                uiListeners.goToPause();
            } else if (data === "playFull") {
                uiListeners.goToPlayFull();
            } else if (data === "progressBarOpened") {
                uiListeners.progressBarOpened();
            } else if (data === "deleteSequence") {
                uiListeners.onDeleteSequence();
            } else if (data === "wallOfFameButton") {
                uiListeners.goToWallOfFame();
            } else if (data === "backButtonWallOfFame") {
                uiListeners.goToBackButtonWallOfFame();
            } else if (data === "moveKeyframeButton") {
                uiListeners.goToMoveKeyframe();
            } else if (data === "deleteKeyframeButton") {
                uiListeners.goToDeleteKeyframe();
            } else if (data === "deleteAllKeyframesButton") {
                uiListeners.goToDeleteAllKeyframes();
            } else if (data === "cutButton") {
                uiListeners.goToCut();
            } else if (data === "switchToReadMode") {
                uiListeners.switchToReadMode();
            } else if (data === "switchToEditMode") {
                uiListeners.switchToEditMode();
            } else {
                CommonClientVariables.console.log(data);
            }
        }

    }
}