/// <reference types="minecraft-scripting-types-Server" />

import { CustomConsole } from "../Utils/CustomConsole";
import { PositionRotationObject, IMarker, TimelineElement } from "../interfaces";
import { getCurrentClientFromEventData } from "../Utils/ConversionTools";
import { ServerTimeline } from "./serverTimeline";
import { frameRate } from "../Const";
import { subdiviseIntervals, subdiviseIntervalsRotY } from "../Utils/MathUtils";
import { CurrentClient } from "./CurrentClient";


namespace Server {
  const serverSystem = server.registerSystem(0, 0);
  const connectedClientsdata = new Array<CurrentClient>();
  const console: CustomConsole = new CustomConsole(serverSystem);
  const serverTimeLine: ServerTimeline = new ServerTimeline(serverSystem);

  /**
  * Initialisation du serveur
  */
  serverSystem.initialize = function () {
    console.initLogger();
    serverSystem.listenForEvent("minecraft:player_attacked_entity", (eventData: IEventData<IPlayerAttackedEntityEventData>) => onEntityHit(eventData));
    serverSystem.listenForEvent("mcbestudio:client_entered_world", (eventData: IEventData<any>) => onClientEnteredWorld(eventData));
    serverSystem.listenForEvent("mcbestudio:enter_place_keyframe_mode", (eventData: IEventData<any>) => onClientEnteredKeyFrameMode(eventData));
    serverSystem.listenForEvent("mcbestudio:generate_sequence", (eventData: IEventData<any>) => generateSequence(eventData));
    serverSystem.listenForEvent("mcbestudio:delete_sequence", (eventData: IEventData<any>) => deleteSequence(eventData));
    serverSystem.listenForEvent("mcbestudio:go_to_first_frame", (eventData: IEventData<any>) => serverTimeLine.goToFirstFrame(getCurrentClientFromEventData(eventData, connectedClientsdata)));
    serverSystem.listenForEvent("mcbestudio:go_to_last_frame", (eventData: IEventData<any>) => serverTimeLine.goToLastFrame(getCurrentClientFromEventData(eventData, connectedClientsdata)));
    serverSystem.listenForEvent("mcbestudio:go_to_next_frame", (eventData: IEventData<any>) => serverTimeLine.goToNextFrame(getCurrentClientFromEventData(eventData, connectedClientsdata)));
    serverSystem.listenForEvent("mcbestudio:go_to_previous_frame", (eventData: IEventData<any>) => serverTimeLine.goToPreviousFrame(getCurrentClientFromEventData(eventData, connectedClientsdata)));
    serverSystem.listenForEvent("mcbestudio:go_to_play", (eventData: IEventData<any>) => serverTimeLine.goToPlay(getCurrentClientFromEventData(eventData, connectedClientsdata), eventData.data.isFullScreen));
    serverSystem.listenForEvent("mcbestudio:go_to_pause", (eventData: IEventData<any>) => serverTimeLine.goToPause(getCurrentClientFromEventData(eventData, connectedClientsdata)));
    serverSystem.listenForEvent("mcbestudio:progressBarOpened", (eventData: IEventData<any>) => progressBarOpened(eventData));
    serverSystem.registerEventData("mcbestudio:exit_place_keyframe_mode", { targetClient: 0 });
    serverSystem.registerEventData("mcbestudio:updateFrameNumber", { targetClient: 0, frameNumber: 0 });
    serverSystem.registerEventData("mcbestudio:openModal", { targetClient: 0 });
    serverSystem.registerEventData("mcbestudio:closeModal", { targetClient: 0 });
    serverSystem.registerEventData("mcbestudio:updateModalValue", { targetClient: 0, currentState: 0 });
    serverSystem.registerEventData("mcbestudio:leaveFullScreen", { targetClient: 0 });
    serverSystem.registerEventData("mcbestudio:notifySequenceEnded", { targetClient: 0 });
    serverSystem.registerEventData("mcbestudio:notifyCurrentFrame", { targetClient: 0, currentFrame: 0 });
    serverSystem.registerComponent("mcbestudio:triggerer", { targetClient: 0, role: "" });
    serverSystem.registerComponent("mcbestudio:keyframe", { targetClient: 0, previous: 0, next: 0, current: 0 });
  };

  /**
  * Appelé à chaque tick
  */
  serverSystem.update = function () {
    //Pour chaque client connecté
    connectedClientsdata.forEach((currentClient: CurrentClient) => {
      //Si on est en mode "plaçage keyframe et que le joueur bouge"
      if (currentClient.isPlacingKeyframe) {
        currentClient.processMarkersUpdate();
      } else if (currentClient.isPlayingSequence) {
        currentClient.displayCurrentComponents();
      }
    });
  };

  /**
  * Appelé lorsqu'un client se connecte au monde
  */
  function onClientEnteredWorld(eventData: IEventData<any>) {
    //On récupère la position et la rotation initiale du joueur
    let playerPositionComponent = serverSystem.getComponent(eventData.data.player, MinecraftComponent.Position);
    let playerRotationComponent = serverSystem.getComponent(eventData.data.player, MinecraftComponent.Rotation);
    //On initialise toute les infos de sauvegarde liées à un joueur
    connectedClientsdata[eventData.data.player.id] = new CurrentClient(
      serverSystem,
      false,
      new Array<IMarker>(), //Permet de stocker les markers
      new Array<TimelineElement>(), //Permet de stocker la timeline
      -1, //Permet de connaitre l'ID de la dernière frame sauvegardée. Vaut -1 si aucune sauvegardée
      0, //Compteur incrémental assignant un ID aux nouvelles frames
      eventData.data.player,
      0, //Nombre total de frame(utile pour la timeline)
      0, //Indique le numéro de frame courante, incrémental peu importe les id (utile pour la timeline)
      null, //Indique la keyframe courante
      new Array<PositionRotationObject>(), //Permet de stocker la timeline "complète" avec toute les transitions
      playerRotationComponent.data.x,
      playerRotationComponent.data.y,
      playerPositionComponent.data.x,
      playerPositionComponent.data.y,
      playerPositionComponent.data.z,
      false, //Notify if the client is playing the sequence full screen
      false, //Notify if the client is playing the sequence
    );
  };

  function onClientEnteredKeyFrameMode(eventData: IEventData<any>) {
    getCurrentClientFromEventData(eventData, connectedClientsdata).onClientEnteredKeyFrameMode();
  }

  function onEntityHit(eventData: IEventData<any>) {
    let hitEntity: IEntity = eventData.data.attacked_entity;
    getCurrentClientFromEventData(eventData, connectedClientsdata).onEntityHit(hitEntity);
  }

  function generateSequence(eventData: IEventData<any>) {
    getCurrentClientFromEventData(eventData, connectedClientsdata).generateSequence();
  }

  function deleteSequence(eventData: IEventData<any>) {
    getCurrentClientFromEventData(eventData, connectedClientsdata).resetTimelineData();
  }

  function progressBarOpened(eventData: IEventData<any>) {
    getCurrentClientFromEventData(eventData, connectedClientsdata).progressBarOpened();
  }

}