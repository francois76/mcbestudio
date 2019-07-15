
import { CommonServerVariables } from "./CommonServerVariables";
import { PositionRotationObject, IMarker, TimelineElement } from "../Interfaces";
import { generateMarker, updateModalValue, sendTimelineUpdate, updatePlayerFollower, broadcastEvent } from "../Utils/Common";
import { subdiviseIntervals, subdiviseIntervalsRotY } from "../Utils/MathUtils";
import { frameRate } from "../Const";
import { ServerTimeline } from "./ServerTimeline";
export class CurrentClient {
    constructor(private _serverSystem: IVanillaServerSystem,
        public isPlacingKeyframe: boolean,
        public markers: Array<IMarker>,
        public timeline: Array<TimelineElement>,
        public lastframe: number,
        public counter: number,
        public player: IEntity,
        public frameNumber: number,
        public currentPosition: number,
        public currentKeyframe: TimelineElement,
        public timelineExtended: Array<PositionRotationObject>,
        public rotX: number,
        public rotY: number,
        public posX: number,
        public posY: number,
        public posZ: number,
        public isPlayingSequenceFullScreen: boolean,
        public isPlayingSequence: boolean,
        public playerFollower: IEntity
    ) {
    }

    onClientEnteredKeyFrameMode() {
        this.isPlacingKeyframe = true;
        let exitEntity: IMarker = generateMarker(this._serverSystem, this.player, "§cBack to menu", 50, "exit");
        exitEntity.angle = 50;
        this.markers[0] = exitEntity;

        let keyframeEntity: IMarker = generateMarker(this._serverSystem, this.player, "§b Place Keyframe", 0, "manageKeyframe");
        keyframeEntity.angle = 0;
        this.markers[1] = keyframeEntity;

        this.timeline.forEach((frame: TimelineElement) => {
            let entityToGenerate = this._serverSystem.createEntity("entity", "mcbestudio:timeline_element_entity");
            this._serverSystem.applyComponentChanges(entityToGenerate, frame.positionComponent);
            this._serverSystem.applyComponentChanges(entityToGenerate, frame.rotationComponent);
            frame.entity = entityToGenerate;
        });
    }

    onEntityHit(hitEntity: IEntity) {
        if (this._serverSystem.hasComponent(hitEntity, "mcbestudio:triggerer")) {
            let triggererComponent = this._serverSystem.getComponent<any>(hitEntity, "mcbestudio:triggerer");
            if (this.isPlacingKeyframe) {
                if (triggererComponent.data.role == "exit") {
                    this.isPlacingKeyframe = false;
                    broadcastEvent("mcbestudio:exit_place_keyframe_mode", {
                        targetClient: this.player.id,
                    }, this._serverSystem);
                    this.markers.forEach((marker: IMarker) => {
                        this._serverSystem.destroyEntity(marker);
                    });
                    this.timeline.forEach((frame: TimelineElement) => {
                        this._serverSystem.destroyEntity(frame.entity);
                    });
                } else if (triggererComponent.data.role == "manageKeyframe") {
                    this.generateKeyframe();
                    let keyframeEntity: IMarker = generateMarker(this._serverSystem, this.player, "§b Placer Keyframe", 0, "manageKeyframe");
                    keyframeEntity.angle = 0;
                    this.markers[1] = keyframeEntity;
                }
            } else if (this.isPlayingSequenceFullScreen) {
                if (triggererComponent.data.role == "playerFollower") {
                    this.isPlayingSequenceFullScreen = false;
                    this.playerFollower = null;
                    broadcastEvent("mcbestudio:leave_full_screen", {
                        targetClient: this.player.id,
                    }, this._serverSystem);
                    sendTimelineUpdate(this._serverSystem, this.player.id, this.currentPosition);
                }
            }
        }
    }

    generateKeyframe() {
        let playerPositionComponent: IComponent<IPositionComponent> = this._serverSystem.getComponent(this.player, MinecraftComponent.Position);
        let playerRotationComponent: IComponent<IRotationComponent> = this._serverSystem.getComponent(this.player, MinecraftComponent.Rotation);
        let entityToGenerate = this._serverSystem.createEntity("entity", "mcbestudio:timeline_element_entity");
        this._serverSystem.applyComponentChanges(entityToGenerate, playerPositionComponent);
        let keyFrameData = this._serverSystem.createComponent<any>(entityToGenerate, "mcbestudio:keyframe");
        keyFrameData.data.previous = this.lastframe;
        let currentFrame = this.counter;
        this.counter += 1;
        keyFrameData.data.current = currentFrame;
        keyFrameData.data.next = -1;
        //On met à jour la liste chainée sur le précédent élément
        if (this.lastframe != -1) {
            this.timeline.find((keyframe: TimelineElement) => keyframe.next == -1).next = currentFrame;
        }
        this.lastframe = currentFrame
        let newLength: number = this.timeline.push(keyFrameData.data);
        this.timeline[newLength - 1].entity = entityToGenerate;
        this.timeline[newLength - 1].positionComponent = playerPositionComponent;
        this.timeline[newLength - 1].rotationComponent = playerRotationComponent;
        this.frameNumber++;
        broadcastEvent("mcbestudio:update_frame_number", {
            targetClient: this.player.id,
            frameNumber: this.frameNumber
        }, this._serverSystem);
        this._serverSystem.applyComponentChanges(entityToGenerate, keyFrameData);
    }

    processMarkersUpdate() {
        //On récupère la position et la rotation
        let playerPositionComponent = this._serverSystem.getComponent<IPositionComponent>(this.player, MinecraftComponent.Position);
        let playerRotationComponent = this._serverSystem.getComponent<IRotationComponent>(this.player, MinecraftComponent.Rotation);
        if (playerPositionComponent.data.x != this.posX || playerPositionComponent.data.y != this.posY || playerPositionComponent.data.z != this.posZ) {
            //On met à jour les dernières infos de position connues
            this.posX = playerPositionComponent.data.x;
            this.posY = playerPositionComponent.data.y;
            this.posZ = playerPositionComponent.data.z;
            this.rotX = playerRotationComponent.data.x - 10; //To put the marker a bit above
            this.rotY = playerRotationComponent.data.y;
            let errorOccured: boolean = false;
            //On parcours tous les markers associés au joueur
            this.markers.forEach((marker: IMarker) => {
                //On récupère leur position
                if (this._serverSystem.hasComponent(marker, MinecraftComponent.Position)) {
                    let entityPosition = this._serverSystem.getComponent<IPositionComponent>(marker, MinecraftComponent.Position);
                    //On calcule la position relative par rapport au joueur
                    entityPosition.data.x = this.posX - 5 * Math.sin((Math.PI * (this.rotY - marker.angle)) / 180) * Math.cos((Math.PI * this.rotX) / 180);
                    entityPosition.data.y = this.posY - 5 * Math.sin((Math.PI * this.rotX) / 180);
                    entityPosition.data.z = this.posZ + 5 * Math.cos((Math.PI * (this.rotY - marker.angle)) / 180) * Math.cos((Math.PI * this.rotX) / 180);
                    //On set la position
                    this._serverSystem.applyComponentChanges(marker, entityPosition);
                } else {
                    errorOccured = true;
                }
            }
            );
            if (errorOccured) {
                this.markers.forEach((marker: IMarker) => {
                    if (this._serverSystem.hasComponent(marker, MinecraftComponent.Position)) {
                        this._serverSystem.destroyEntity(marker);
                    }
                });
                let exitEntity: IMarker = generateMarker(this._serverSystem, this.player, "§cBack to menu", 50, "exit");
                exitEntity.angle = 50;
                this.markers[0] = exitEntity;

                let keyframeEntity: IMarker = generateMarker(this._serverSystem, this.player, "§b Place Keyframe", 0, "manageKeyframe");
                keyframeEntity.angle = 0;
                this.markers[1] = keyframeEntity;
            }
            if (this.frameNumber >= 2) {
                let lastFrameObject: TimelineElement = this.timeline.find((keyframe: TimelineElement) => keyframe.next == -1);
                let preLastFrame: TimelineElement = this.timeline.find((keyframe: TimelineElement) => keyframe.next == lastFrameObject.current);
                let previousDistance: number = Math.sqrt(Math.pow(lastFrameObject.positionComponent.data.x - preLastFrame.positionComponent.data.x, 2) + Math.pow(lastFrameObject.positionComponent.data.y - preLastFrame.positionComponent.data.y, 2) + Math.pow(lastFrameObject.positionComponent.data.z - preLastFrame.positionComponent.data.z, 2));
                let currentDistance: number = Math.sqrt(Math.pow(lastFrameObject.positionComponent.data.x - this.posX, 2) + Math.pow(lastFrameObject.positionComponent.data.y - this.posY, 2) + Math.pow(lastFrameObject.positionComponent.data.z - this.posZ, 2));
                let entityToGenerateName = this._serverSystem.createComponent<INameableComponent>(this.markers[1], MinecraftComponent.Nameable);
                if (previousDistance !== currentDistance) {
                    entityToGenerateName.data.name = "§b Place Keyframe (" + Math.round((previousDistance / currentDistance) * 100) / 100 + ")";
                } else {
                    entityToGenerateName.data.name = "§b Place Keyframe (infinity)";
                }

                entityToGenerateName.data.alwaysShow = true;
                entityToGenerateName.data.allowNameTagRenaming = false;
                this._serverSystem.applyComponentChanges(this.markers[1], entityToGenerateName);
            }
        } else {
            //Sinon, on met juste à jour les données de position du joueur
            this.posX = playerPositionComponent.data.x;
            this.posY = playerPositionComponent.data.y;
            this.posZ = playerPositionComponent.data.z;
            this.rotX = playerRotationComponent.data.x;
            this.rotY = playerRotationComponent.data.y;
        }
    }

    displayCurrentComponents() {
        if (this.timelineExtended[this.currentPosition]) {
            this._serverSystem.applyComponentChanges(this.player, this.timelineExtended[this.currentPosition].positionComponent);
            this._serverSystem.applyComponentChanges(this.player, this.timelineExtended[this.currentPosition].rotationComponent);
            if (this.isPlayingSequenceFullScreen) {
                updatePlayerFollower(this._serverSystem, this);
            }
            this.currentPosition++;
            sendTimelineUpdate(this._serverSystem, this.player.id, this.currentPosition);
        } else {
            this.isPlayingSequence = false;
            if (this.isPlayingSequenceFullScreen) {
                this.isPlayingSequenceFullScreen = false;
                broadcastEvent("mcbestudio:notify_sequence_ended", { targetClient: this.player.id }, this._serverSystem);
            } else {
                broadcastEvent("mcbestudio:notify_sequence_ended", { targetClient: this.player.id }, this._serverSystem);
            }
        }
    }

    removeSequence() {
        this.isPlayingSequence = false; //Notify if the client is playing the sequence
        this.isPlayingSequenceFullScreen = false; //Notify if the client is playing the sequence full screen
        this.timelineExtended = new Array(); //Permet de stocker la timeline "complète" avec toute les transitions
        this.currentKeyframe = null; //Indique la keyframe courante
        this.currentPosition = 0; //Indique le numéro de frame courante, incrémental peu importe les id (utile pour la timeline)
    }

    deleteAllKeyframes() {
        this.currentKeyframe = null; //Indique la keyframe courante
        this.frameNumber = 0; //Nombre total de frame(utile pour la timeline)
        this.lastframe = -1; //Permet de connaitre l'ID de la dernière frame sauvegardée. Vaut -1 si aucune sauvegardée
        this.timeline = new Array(); //Permet de stocker la timeline
        this.counter = 0; //Compteur incrémental assignant un ID aux nouvelles frames
    }

    generateSequence() {
        if (this.timeline.length > 0) {
            broadcastEvent("mcbestudio:open_modal", { targetClient: this.player.id }, this._serverSystem);
        }
    }

    progressBarOpened() {
        let px: Array<number> = new Array();
        let py: Array<number> = new Array();
        let pz: Array<number> = new Array();
        let rx: Array<number> = new Array();
        let ry: Array<number> = new Array();
        let currentKeyframe: TimelineElement = this.timeline.find((keyframe: TimelineElement) => keyframe.previous == -1);
        let next: number = currentKeyframe["current"];
        while (currentKeyframe.next != -1) {
            currentKeyframe = this.timeline.find((keyframe: TimelineElement) => keyframe.current == next);
            px.push(currentKeyframe.positionComponent.data.x);
            py.push(currentKeyframe.positionComponent.data.y);
            pz.push(currentKeyframe.positionComponent.data.z);
            rx.push(currentKeyframe.rotationComponent.data.x);
            ry.push(currentKeyframe.rotationComponent.data.y);
            next = currentKeyframe.next;
        }
        let pxe: Array<number> = subdiviseIntervals(px, frameRate);
        let pye: Array<number> = subdiviseIntervals(py, frameRate);
        let pze: Array<number> = subdiviseIntervals(pz, frameRate);
        let rxe: Array<number> = subdiviseIntervals(rx, frameRate);
        let rye: Array<number> = subdiviseIntervalsRotY(ry, frameRate);
        let i: number = 0;
        for (let i: number = 0; i < pxe.length; i++) {

            let positionComponent = this._serverSystem.getComponent(this.player, MinecraftComponent.Position);
            let rotationComponent = this._serverSystem.getComponent(this.player, MinecraftComponent.Rotation);
            positionComponent.data.x = pxe[i];
            positionComponent.data.y = pye[i];
            positionComponent.data.z = pze[i];
            rotationComponent.data.x = rxe[i];
            rotationComponent.data.y = rye[i];
            this.timelineExtended[i] = {
                positionComponent,
                rotationComponent
            };
            updateModalValue(this._serverSystem, this.player.id, Math.floor((i / pxe.length) * 10) * 10);
        }
        pxe = undefined;
        pye = undefined;
        pze = undefined;
        rxe = undefined;
        rye = undefined;
        px = undefined;
        py = undefined;
        pz = undefined;
        rx = undefined;
        ry = undefined;
        updateModalValue(this._serverSystem, this.player.id, 100);
        broadcastEvent("mcbestudio:close_modal", { targetClient: this.player.id }, this._serverSystem);
    }

    deleteCurrentKeyframe() {
        if (this.isPlayingSequence) {
            return;
        }
        if (this.timelineExtended.length > 0) {
            this.timelineExtended = new Array();
        }
        let newPosition: number = 0;
        //Case at the middle of the timeline
        if (this.timeline.length === 0 || this.currentKeyframe === undefined || (this.currentKeyframe.previous == -1 && this.currentKeyframe.next == -1)) {
            this.deleteAllKeyframes();
        } else if (this.currentKeyframe.previous !== -1 && this.currentKeyframe.next !== -1) {
            let previousKeyFrame: TimelineElement = this.timeline.find((timelineElement: TimelineElement) => timelineElement.current === this.currentKeyframe.previous);
            let nextKeyFrame: TimelineElement = this.timeline.find((timelineElement: TimelineElement) => timelineElement.current === this.currentKeyframe.next);
            previousKeyFrame.next = nextKeyFrame.current;
            nextKeyFrame.previous = previousKeyFrame.current;
            let newTimeline: Array<TimelineElement> = this.timeline.filter((timelineElement: TimelineElement) => timelineElement.current !== this.currentKeyframe.current);
            this.timeline = newTimeline;
            this.currentKeyframe = previousKeyFrame;
            newPosition = (Math.trunc(this.currentPosition / frameRate) - 1) * frameRate;
            this.frameNumber--;
            //First frame deleted
        } else if (this.currentKeyframe.previous === -1) {
            let nextKeyFrame: TimelineElement = this.timeline.find((timelineElement: TimelineElement) => timelineElement.current === this.currentKeyframe.next);
            nextKeyFrame.previous = -1;
            let newTimeline: Array<TimelineElement> = this.timeline.filter((timelineElement: TimelineElement) => timelineElement.current !== this.currentKeyframe.current);
            this.timeline = newTimeline;
            this.currentKeyframe = nextKeyFrame;
            newPosition = 0;
            this.frameNumber--;
        } else if (this.currentKeyframe.next === -1) {
            let previousKeyFrame: TimelineElement = this.timeline.find((timelineElement: TimelineElement) => timelineElement.current === this.currentKeyframe.previous);
            previousKeyFrame.next = -1;
            let newTimeline: Array<TimelineElement> = this.timeline.filter((timelineElement: TimelineElement) => timelineElement.current !== this.currentKeyframe.current);
            this.timeline = newTimeline;
            this.currentKeyframe = previousKeyFrame;
            newPosition = (Math.trunc(this.currentPosition / frameRate) - 1) * frameRate;
            this.frameNumber--;
        }
        this.currentPosition = newPosition;
        let timeline: ServerTimeline = new ServerTimeline(CommonServerVariables.system);
        if (this.currentKeyframe) {
            timeline.updatePositionPlayerFromFrame(this);
        }
        broadcastEvent("mcbestudio:update_frame_number", {
            targetClient: this.player.id,
            frameNumber: this.frameNumber
        }, this._serverSystem);
    }


}