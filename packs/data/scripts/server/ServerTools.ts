import { CurrentClient } from "../server/CurrentClient";
import { broadcastEvent } from "../Common/Common";
import { CommonServerVariables } from "./CommonServerVariables";

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

export function subdiviseIntervals(array: Array<number>, slices: number, jump: Array<boolean>) {
    let newArray: Array<number> = new Array();
    let i: number = 0;
    while (array[i] && array[i + 1]) {
        if (jump[i]) {
            CommonServerVariables.console.log("test");
            newArray.push(array[i]);
        } else {
            let delta: number = array[i + 1] - array[i];
            let subInterval: number = delta / slices;
            let p: number = 0;
            while (p != slices - 1) {
                newArray.push(array[i] + (p * subInterval));
                p++;
            }
        }

        i++;
    }
    if (array[i]) {
        newArray.push(array[i]);
    }
    return newArray;

}

//Cas particulier de la rotation y pour prendre en compte le passage -180/0
export function subdiviseIntervalsRotY(array: Array<number>, slices: number, jump: Array<boolean>) {
    let newArray: Array<number> = new Array();
    let cosArray: Array<number> = new Array();
    let sinArray: Array<number> = new Array();
    for (let i = 0; i < array.length; i++) {
        cosArray[i] = Math.cos((Math.PI * array[i]) / 180);
        sinArray[i] = Math.sin((Math.PI * array[i]) / 180);
    }
    let cosArrayUpdated: Array<number> = subdiviseIntervals(cosArray, slices, jump);
    let sinArrayUpdated: Array<number> = subdiviseIntervals(sinArray, slices, jump);
    for (let i = 0; i < cosArrayUpdated.length; i++) {
        if (cosArrayUpdated[i] === 0) {
            if (sinArrayUpdated[i] === 1) {
                newArray[i] = 90;
            } else {
                newArray[i] = -90;
            }
        } else {
            if (cosArrayUpdated[i] > 0) {
                newArray[i] = (Math.atan(sinArrayUpdated[i] / cosArrayUpdated[i]) * 180) / Math.PI;
            } else {
                newArray[i] = 180 - (Math.atan(-sinArrayUpdated[i] / cosArrayUpdated[i]) * 180) / Math.PI;
            }
        }
    }
    return newArray;

}