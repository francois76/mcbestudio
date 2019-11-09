import { EventAction } from "./Enums";

export interface PositionRotationObject {
    positionComponent: IComponent<IPositionComponent>,
    rotationComponent: IComponent<IRotationComponent>
}

export interface TimelineElement {
    entity: IEntity,
    positionComponent: IComponent<IPositionComponent>,
    rotationComponent: IComponent<IRotationComponent>,
    next: number,
    previous: number,
    current: number,
    nextFrameToJump: TimelineElement
}


export interface IMarker extends IEntity {
    angle?: number;
}

export interface EventManagerElement {
    name: string;
    server_action: EventAction;
    client_action: EventAction;
}