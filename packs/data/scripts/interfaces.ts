export interface CurrentClient{
    isPlacingKeyframe:boolean,
    markers:Array<any>,
    timeline:Array<any>,
    lastframe:number,
    counter:number,
    player:any,
    frameNumber:any,
    currentPosition:number,
    currentKeyframe:any,
    timelineExtended:Array<PositionRotationObject>,
    rotX:number,
    rotY:number,
    posX:number,
    posY:number,
    posZ:number,
    isPlayingSequenceFullScreen:boolean,
    isPlayingSequence:boolean
}

export interface PositionRotationObject{
    positionComponent:IComponent<IPositionComponent>,
    rotationComponent:IComponent<IRotationComponent>
}