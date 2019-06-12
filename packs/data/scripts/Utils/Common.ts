export function generateMarker(_serverSystem: IVanillaServerSystem, player: IEntity, name: string, rotation: number, role: string) {
    let playerPositionComponent: IComponent<IPositionComponent> = _serverSystem.getComponent(player, MinecraftComponent.Position);
    let playerRotationComponent: IComponent<IRotationComponent> = _serverSystem.getComponent(player, MinecraftComponent.Rotation);
    let entityToGenerate = _serverSystem.createEntity("entity", "minecraft:armor_stand");
    let entityToGeneratePosition = getPositionAroundPlayer(_serverSystem, entityToGenerate, playerPositionComponent, playerRotationComponent, 4, rotation);
    _serverSystem.applyComponentChanges(entityToGenerate, entityToGeneratePosition);
    let entityToGenerateName = _serverSystem.createComponent(entityToGenerate, MinecraftComponent.Nameable);
    entityToGenerateName.data.name = name;
    entityToGenerateName.data.alwaysShow = true;
    entityToGenerateName.data.allowNameTagRenaming = false;
    _serverSystem.applyComponentChanges(entityToGenerate, entityToGenerateName);
    let entityRole = _serverSystem.createComponent<any>(entityToGenerate, "mcbestudio:triggerer");
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