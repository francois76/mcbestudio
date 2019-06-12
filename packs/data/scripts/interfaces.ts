
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
    current: number
}


export interface IMarker extends IEntity {
    angle?: number;
}