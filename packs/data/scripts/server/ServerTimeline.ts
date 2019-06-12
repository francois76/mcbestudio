import { frameRate } from "../Const";
import { CustomConsole } from "../Utils/CustomConsole";
import { CurrentClient } from "./CurrentClient";
export class ServerTimeline {

  console: CustomConsole = new CustomConsole(this._serverSystem);
  constructor(private _serverSystem: IVanillaServerSystem) {
  }

  goToFirstFrame(currentClient: CurrentClient) {
    currentClient.currentPosition = 0;
    currentClient.currentKeyframe = currentClient.timeline.find((keyframe: any) => keyframe.previous == -1);
    this.updatePositionPlayerFromFrame(currentClient);
  }

  goToLastFrame(currentClient: CurrentClient) {
    currentClient.currentPosition = currentClient.timelineExtended.length;
    currentClient.currentKeyframe = currentClient.timeline.find((keyframe: any) => keyframe.next == -1);
    this.updatePositionPlayerFromFrame(currentClient);
  }

  goToNextFrame(currentClient: CurrentClient) {
    if (currentClient.currentKeyframe === null) {
      this.goToFirstFrame(currentClient);
    }
    let newPosition: number = (Math.trunc(currentClient.currentPosition / frameRate) + 1) * frameRate
    currentClient.currentPosition = newPosition;
    let newCurrentKeyframeid = currentClient.currentKeyframe.next;
    currentClient.currentKeyframe = currentClient.timeline[newCurrentKeyframeid];
    this.updatePositionPlayerFromFrame(currentClient);
  }

  goToPreviousFrame(currentClient: CurrentClient) {
    if (currentClient.currentKeyframe === null) {
      this.goToLastFrame(currentClient);
    }
    let newPosition: number = (Math.trunc(currentClient.currentPosition / frameRate) - 1) * frameRate
    currentClient.currentPosition = newPosition;
    let newCurrentKeyframeid = currentClient.currentKeyframe.previous;
    currentClient.currentKeyframe = currentClient.timeline[newCurrentKeyframeid];
    this.updatePositionPlayerFromFrame(currentClient);
  }

  goToPlay(currentClient: CurrentClient, isFullScreen: boolean) {
    if (currentClient.currentKeyframe === null) {
      this.goToFirstFrame(currentClient);
    }
    if (isFullScreen) {
      currentClient.isPlayingSequenceFullScreen = true;
    } else {
      currentClient.isPlayingSequenceFullScreen = false;
    }
    currentClient.isPlayingSequence = true;
  }

  goToPause(currentClient: CurrentClient) {
    currentClient.isPlayingSequence = false;
  }

  updatePositionPlayerFromFrame(currentClient: CurrentClient) {
    if (currentClient.currentKeyframe) {
      this._serverSystem.applyComponentChanges(currentClient.player, currentClient.currentKeyframe.positionComponent);
      this._serverSystem.applyComponentChanges(currentClient.player, currentClient.currentKeyframe.rotationComponent);
    }
  }
}