/// <reference types="minecraft-scripting-types-Server" />

import { CustomConsole } from "../Utils/CustomConsole";
import { ServerTimeline } from "./serverTimeline";
import { CurrentClient } from "./CurrentClient";
import { initEvents } from "../Utils/Common";
import { ServerListeners } from "./ServerListeners";
import { CommonServerVariables } from "./CommonServerVariables";
import { System } from "../Enums";


namespace Server {
  const serverSystem = server.registerSystem(0, 0);
  const connectedClientsdata = new Array<CurrentClient>();
  const console: CustomConsole = new CustomConsole(serverSystem);
  const serverTimeLine: ServerTimeline = new ServerTimeline(serverSystem);

  /**
  * Initialisation du serveur
  */
  serverSystem.initialize = function () {
    CommonServerVariables.connectedClientsdata = connectedClientsdata;
    CommonServerVariables.console = console;
    CommonServerVariables.serverTimeline = serverTimeLine;
    CommonServerVariables.system = serverSystem;
    console.initLogger();
    initEvents(System.SERVER, new ServerListeners(serverSystem));
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

  serverSystem.shutdown = function () {
    /*serverSystem.executeCommand("/kill @e[type=mcbestudio:marker]", null);
    serverSystem.executeCommand("/kill @e[type=mcbestudio:player_follower]", null);
    serverSystem.executeCommand("/kill @e[type=mcbestudio:timeline_element_entity]", null);*/
  }

}