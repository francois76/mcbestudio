/// <reference types="minecraft-scripting-types-Client" />

import { CustomConsole } from "../Common/CustomConsole";
import { initEvents } from "../Common/Common";
import { ClientListeners } from "./ClientListeners";
import { CommonClientVariables } from "./CommonClientVariables";
import { System } from "../api/Enums";


namespace Client {
  const clientSystem = client.registerSystem(0, 0);
  const console: CustomConsole = new CustomConsole(clientSystem);

  // init listeners
  clientSystem.initialize = function () {
    console.initLogger();
    CommonClientVariables.console = console;
    CommonClientVariables.system = clientSystem;
    initEvents(System.CLIENT, new ClientListeners());
  };
}