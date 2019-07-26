import { EventManagerElement } from "../api/Interfaces";
import { EventAction, System } from "../api/Enums";
import { EventManagerProvider } from "./EventManagerProvider";
import { CommonClientVariables } from "../client/CommonClientVariables";
import { CommonServerVariables } from "../server/CommonServerVariables";
import { BothListeners, BothSystem } from "../api/Types";
import { camelize } from "../api/ApiFunctions";


export function initEvents(systemName: System, listeners: BothListeners) {
    const eventArray = EventManagerProvider.eventList;
    let subArray: Array<EventManagerElement>;
    let _system: BothSystem;
    if (systemName == System.SERVER) {
        _system = CommonServerVariables.system;
        subArray = eventArray.filter((element: EventManagerElement) => { return element.server_action != EventAction.NO });
        subArray.forEach((element: EventManagerElement) => {
            if (element.server_action === EventAction.LISTEN) {
                _system.listenForEvent(element.name, (eventData: IEventData<any>) => invokeRightListener(eventData, element.name, listeners))
            } else if (element.server_action === EventAction.REGISTER) {
                _system.registerEventData(element.name, {});
            }
        });
    } else {
        _system = CommonClientVariables.system;
        subArray = eventArray.filter((element: EventManagerElement) => { return element.client_action !== EventAction.NO });
        subArray.forEach((element: EventManagerElement) => {
            if (element.client_action === EventAction.LISTEN) {
                _system.listenForEvent(element.name, (eventData: IEventData<any>) => invokeRightListener(eventData, element.name, listeners))
            } else if (element.client_action === EventAction.REGISTER) {
                _system.registerEventData(element.name, {});
            }
        });
    }
}

export function broadcastEvent(name: string, data: any, system: BothSystem) {
    const eventData: IEventData<any> = system.createEventData(name);
    eventData.data = data;
    system.broadcastEvent(name, eventData);

}



function invokeRightListener(eventData: any, name: string, listeners: BothListeners) {
    if (!eventData.data.targetClient || CommonClientVariables.clientId === -1 || CommonClientVariables.clientId === eventData.data.targetClient) {
        let functionName = camelize(name.split(":")[1]);
        if (!(eventData.data instanceof Object)) {
            let params: Array<any> = new Array();
            params.push(eventData.data);
            listeners.callFunction(functionName, params);
        } else {
            eventData.data.targetClient = undefined;
            let values = (Object.keys(eventData.data) as Array<keyof typeof eventData.data>).reduce((accumulator, current) => {
                accumulator.push(eventData.data[current]);
                return accumulator;
            }, [] as (typeof eventData.data[keyof typeof eventData.data])[]);
            listeners.callFunction(functionName, values);
        }
    }
}

