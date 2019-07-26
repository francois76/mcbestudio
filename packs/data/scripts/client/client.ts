/// <reference types="minecraft-scripting-types-Client" />

import { CustomConsole } from "../Utils/CustomConsole";
import { initEvents } from "../Utils/Common";
import { ClientListeners } from "./ClientListeners";
import { CommonClientVariables } from "./CommonClientVariables";
import { System } from "../Enums";


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