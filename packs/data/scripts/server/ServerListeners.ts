import { CurrentClient } from "./CurrentClient";
import { CommonServerVariables } from "./CommonServerVariables";
import { IMarker, TimelineElement, PositionRotationObject } from "../api/Interfaces";
import { AbstractListener } from "../Common/AbstractListener";

export class ServerListeners extends AbstractListener {

    constructor() {
        super();
        this.functions = {
            //Vanilla listener
            playerAttackedEntity(player: IEntity, attacked_entity: IEntity) {
                CommonServerVariables.connectedClientsdata[player.id].onEntityHit(attacked_entity);
            },
            //Custom listeners
            clientEnteredWorld(player: IEntity) {
                //On récupère la position et la rotation initiale du joueur
                let playerPositionComponent = CommonServerVariables.system.getComponent(player, MinecraftComponent.Position);
                let playerRotationComponent = CommonServerVariables.system.getComponent(player, MinecraftComponent.Rotation);
                //On initialise toute les infos de sauvegarde liées à un joueur
                CommonServerVariables.connectedClientsdata[player.id] = new CurrentClient(
                    CommonServerVariables.system,
                    false,
                    new Array<IMarker>(), //Permet de stocker les markers
                    new Array<TimelineElement>(), //Permet de stocker la timeline
                    -1, //Permet de connaitre l'ID de la dernière frame sauvegardée. Vaut -1 si aucune sauvegardée
                    0, //Compteur incrémental assignant un ID aux nouvelles frames
                    player,
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
                    null
                );
            },
            enterPlaceKeyframeMode(playerId: number) {
                CommonServerVariables.connectedClientsdata[playerId].onClientEnteredKeyFrameMode();
            },
            generateSequence(playerId: number) {
                CommonServerVariables.connectedClientsdata[playerId].generateSequence();
            },
            deleteSequence(playerId: number) {
                CommonServerVariables.connectedClientsdata[playerId].removeSequence();
            },
            progressBarOpened(playerId: number) {
                CommonServerVariables.connectedClientsdata[playerId].progressBarOpened();
            },
            //Timeline listeners
            goToFirstFrame(playerId: number) {
                CommonServerVariables.serverTimeline.goToFirstFrame(CommonServerVariables.connectedClientsdata[playerId]);
            },
            goToLastFrame(playerId: number) {
                CommonServerVariables.serverTimeline.goToLastFrame(CommonServerVariables.connectedClientsdata[playerId]);
            },
            goToNextFrame(playerId: number) {
                CommonServerVariables.serverTimeline.goToNextFrame(CommonServerVariables.connectedClientsdata[playerId]);
            },
            goToPreviousFrame(playerId: number) {
                CommonServerVariables.serverTimeline.goToPreviousFrame(CommonServerVariables.connectedClientsdata[playerId]);
            },
            goToPlay(playerId: number, isFullScreen: boolean) {
                CommonServerVariables.serverTimeline.goToPlay(CommonServerVariables.connectedClientsdata[playerId], isFullScreen);
            },
            goToPause(playerId: number) {
                CommonServerVariables.serverTimeline.goToPause(CommonServerVariables.connectedClientsdata[playerId]);
            },
            moveKeyframe(playerId: number) {
                CommonServerVariables.console.log("Ability to move keyframe coming soon");
            },
            deleteKeyframe(playerId: number) {
                CommonServerVariables.connectedClientsdata[playerId].deleteCurrentKeyframe();
            },
            deleteAllKeyframes(playerId: number) {
                CommonServerVariables.connectedClientsdata[playerId].deleteAllKeyframes();
            },
            cutSequence(playerId: number) {
                CommonServerVariables.console.log("Ability to add cut in sequence coming soon");
            },

        }
    }
}