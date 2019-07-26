

export class CustomConsole {

  constructor(private _system: ISystem<any>) {
  }

  log = function (object: any) {
    let event = this._system.createEventData('minecraft:display_chat_event');
    if (object instanceof Object) {
      event.data.message = JSON.stringify(object);
    } else {
      event.data.message = object;
    }
    this._system.broadcastEvent('minecraft:display_chat_event', event);
  }

  initLogger = function () {
    let loggerEvent = this._system.createEventData('minecraft:script_logger_config');
    loggerEvent.data.log_errors = true;
    loggerEvent.data.log_warnings = true;
    loggerEvent.data.log_information = true;
    this._system.broadcastEvent('minecraft:script_logger_config', loggerEvent);
  };

}