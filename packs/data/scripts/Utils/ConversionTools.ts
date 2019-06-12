import { CurrentClient } from "../server/CurrentClient";

export function getCurrentClientFromEventData(eventData: IEventData<any>, connectedClientData: Array<CurrentClient>): CurrentClient {
    if (eventData.data.player) {
        return connectedClientData[eventData.data.player.id];
    }
    return connectedClientData[eventData.data.id];
}