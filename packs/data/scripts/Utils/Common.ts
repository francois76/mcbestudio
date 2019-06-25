import { CurrentClient } from "../server/CurrentClient";
import { EventManagerElement } from "./../interfaces";
import { EventAction, System } from "./../Enums";
import { EventManagerProvider } from "./EventManagerProvider";
import { ServerListeners } from "../server/ServerListeners";
import { ClientListeners } from "../client/ClientListeners";
import { CommonClientVariables } from "../client/CommonClientVariables";
import { CommonServerVariables } from "../server/CommonServerVariables";

export function generateMarker(_serverSystem: IVanillaServerSystem, player: IEntity, name: string, rotation: number, role: string) {
    let playerPositionComponent: IComponent<IPositionComponent> = _serverSystem.getComponent(player, MinecraftComponent.Position);
    let playerRotationComponent: IComponent<IRotationComponent> = _serverSystem.getComponent(player, MinecraftComponent.Rotation);
    let entityToGenerate = _serverSystem.createEntity("entity", "mcbestudio:marker");
    let entityToGeneratePosition = getPositionAroundPlayer(_serverSystem, entityToGenerate, playerPositionComponent, playerRotationComponent, 4, rotation);
    _serverSystem.applyComponentChanges(entityToGenerate, entityToGeneratePosition);
    let entityToGenerateName = _serverSystem.createComponent(entityToGenerate, MinecraftComponent.Nameable);
    entityToGenerateName.data.name = name;
    entityToGenerateName.data.alwaysShow = true;
    entityToGenerateName.data.allowNameTagRenaming = false;
    _serverSystem.applyComponentChanges(entityToGenerate, entityToGenerateName);
    let entityRole: IComponent<any> = _serverSystem.createComponent<any>(entityToGenerate, "mcbestudio:triggerer");
    entityRole.data.role = role;
    _serverSystem.applyComponentChanges(entityToGenerate, entityRole);
    return entityToGenerate;

}

export function getPositionAroundPlayer(_serverSystem: IVanillaServerSystem, targetEntity: any, playerPosition: any, playerRotation: any, radius: number, angle: number) {
    let rotX = playerRotation.data.x;
    let rotY = playerRotation.data.y - angle;
    let posX = playerPosition.data.x;
    let posY = playerPosition.data.y;
    let posZ = playerPosition.data.z;
    let entityPosition = _serverSystem.createComponent(targetEntity, MinecraftComponent.Position);
    entityPosition.data.x = posX - radius * Math.sin((Math.PI * rotY) / 180) * Math.cos((Math.PI * rotX) / 180);
    entityPosition.data.y = posY - radius * Math.sin((Math.PI * rotX) / 180);
    entityPosition.data.z = posZ + radius * Math.cos((Math.PI * rotY) / 180) * Math.cos((Math.PI * rotX) / 180);
    return entityPosition;
}

export function updateModalValue(_serverSystem: IVanillaServerSystem, clientId: number, value: number) {
    broadcastEvent("mcbestudio:update_modal_value", {
        targetClient: clientId,
        currentState: value
    }, _serverSystem);
}

export function sendTimelineUpdate(_serverSystem: IVanillaServerSystem, clientId: number, value: number) {
    broadcastEvent("mcbestudio:notify_current_frame", {
        targetClient: clientId,
        currentFrame: value
    }, _serverSystem);
}

export function summonPlayerFollower(_serverSystem: IVanillaServerSystem, client: CurrentClient) {
    let playerPositionComponent: IComponent<IPositionComponent> = _serverSystem.getComponent(client.player, MinecraftComponent.Position);
    let entityToGenerate = _serverSystem.createEntity("entity", "mcbestudio:player_follower");
    _serverSystem.applyComponentChanges(entityToGenerate, playerPositionComponent);
    let entityRole = _serverSystem.createComponent<any>(entityToGenerate, "mcbestudio:triggerer");
    entityRole.data.role = "playerFollower";
    _serverSystem.applyComponentChanges(entityToGenerate, entityRole);
    client.playerFollower = entityToGenerate;
}

export function updatePlayerFollower(_serverSystem: IVanillaServerSystem, client: CurrentClient) {
    let playerPositionComponent: IComponent<IPositionComponent> = _serverSystem.getComponent(client.player, MinecraftComponent.Position);
    _serverSystem.applyComponentChanges(client.playerFollower, playerPositionComponent);
}

export type BothSystem = IVanillaClientSystem | IVanillaServerSystem;
export type BothListeners = ServerListeners | ClientListeners;

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

function camelize(key: string) {
    key = key.replace(/[\-_\s]+(.)?/g, function (match, ch) {
        return ch ? ch.toUpperCase() : '';
    });
    // Ensure 1st char is always lowercase
    return key.substr(0, 1).toLowerCase() + key.substr(1);
}