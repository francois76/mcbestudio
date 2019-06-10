/// <reference types="minecraft-scripting-types-Server" />

import { CustomConsole } from "../Utils/CustomConsole";
import {CurrentClient,PositionRotationObject} from "../interfaces";


namespace Server {
    const serverSystem = server.registerSystem(0, 0);
const connectedClientsdata = new Array();
const console:CustomConsole = new CustomConsole(serverSystem);

const frameRate = 240;

/**
* Initialisation du serveur
*/
serverSystem.initialize = function () {
  console.initLogger();
  serverSystem.listenForEvent("minecraft:player_attacked_entity", (eventData:IEventData<IPlayerAttackedEntityEventData>) => onEntityHit(eventData));
  serverSystem.listenForEvent("mcbestudio:client_entered_world", (eventData:any) => onClientEnteredWorld(eventData));
  serverSystem.listenForEvent("mcbestudio:enter_place_keyframe_mode", (eventData:any) => onClientEnteredKeyFrameMode(eventData));
  serverSystem.listenForEvent("mcbestudio:generate_sequence", (eventData:any) => generateSequence(eventData));
  serverSystem.listenForEvent("mcbestudio:delete_sequence", (eventData:any) => deleteSequence(eventData));
  serverSystem.listenForEvent("mcbestudio:go_to_first_frame", (eventData:any) => goToFirstFrame(eventData));
  serverSystem.listenForEvent("mcbestudio:go_to_last_frame", (eventData:any) => goToLastFrame(eventData));
  serverSystem.listenForEvent("mcbestudio:go_to_next_frame", (eventData:any) => goToNextFrame(eventData));
  serverSystem.listenForEvent("mcbestudio:go_to_previous_frame", (eventData:any) => goToPreviousFrame(eventData));
  serverSystem.listenForEvent("mcbestudio:go_to_play", (eventData:any) => goToPlay(eventData));
  serverSystem.listenForEvent("mcbestudio:go_to_pause", (eventData:any) => goToPause(eventData));
  serverSystem.listenForEvent("mcbestudio:progressBarOpened", (eventData:any) => progressBarOpened(eventData));
  serverSystem.registerEventData("mcbestudio:exit_place_keyframe_mode", {targetClient:0});
  serverSystem.registerEventData("mcbestudio:updateFrameNumber", {targetClient:0, frameNumber:0});
  serverSystem.registerEventData("mcbestudio:openModal", {targetClient:0});
  serverSystem.registerEventData("mcbestudio:closeModal", {targetClient:0});
  serverSystem.registerEventData("mcbestudio:updateModalValue", { targetClient:0, currentState:0});
  serverSystem.registerEventData("mcbestudio:leaveFullScreen", {targetClient:0});
  serverSystem.registerEventData("mcbestudio:notifySequenceEnded", {targetClient:0});
  serverSystem.registerEventData("mcbestudio:notifyCurrentFrame", {targetClient:0, currentFrame:0});
  serverSystem.registerComponent("mcbestudio:triggerer", { targetClient:0, role:""});
  serverSystem.registerComponent("mcbestudio:keyframe", { targetClient:0, previous:0, next:0, current:0});
};

/**
* Appelé à chaque tick
*/
serverSystem.update = function () {
  //Pour chaque client connecté
  connectedClientsdata.forEach(clientConnected => {
    //Si on est en mode "plaçage keyframe et que le joueur bouge"
    if(clientConnected.isPlacingKeyframe){
      processMarkersUpdate(clientConnected);
    }else if(clientConnected.isPlayingSequence){
      displayCurrentComponents(clientConnected);
    }
    
  });
};

/**
* Appelé lorsqu'un client se connecte au monde
*/
function onClientEnteredWorld(eventData:any) {
  //On récupère la position et la rotation initiale du joueur
  let playerPositionComponent = serverSystem.getComponent(eventData.data.player, MinecraftComponent.Position);
  let playerRotationComponent = serverSystem.getComponent(eventData.data.player, MinecraftComponent.Rotation);
  //On initialise toute les infos de sauvegarde liées à un joueur
  connectedClientsdata[eventData.data.player.id] = new Object();
  let currentClient:CurrentClient = connectedClientsdata[eventData.data.player.id];
  currentClient.isPlacingKeyframe = false; //true si le joueur est en mode "placer des keyframe"
  currentClient.player = eventData.data.player; //Contient la référence du joueur
  currentClient.rotX = playerRotationComponent.data.x; //Position x du joueur
  currentClient.rotY = playerRotationComponent.data.y; //Position y du joueur
  currentClient.posX = playerPositionComponent.data.x; //Position z du joueur
  currentClient.posY = playerPositionComponent.data.y; //Rotation y du joueur
  currentClient.posZ = playerPositionComponent.data.z; //Rotation z du joueur
  initClientTimelineData(currentClient);
};

function onClientEnteredKeyFrameMode(eventData:any){
  let currentClient:CurrentClient = connectedClientsdata[eventData.data.id];
  currentClient.isPlacingKeyframe = true;
  let exitEntity:any = generateMarker(currentClient, "§cBack to menu",45,"exit");
  exitEntity.angle = 45;
  currentClient.markers[0] = exitEntity;
  
  let keyframeEntity:any = generateMarker(currentClient, "§b Place Keyframe",0,"manageKeyframe");
  keyframeEntity.angle = 0;
  currentClient.markers[1] = keyframeEntity;

  currentClient.timeline.forEach((frame:any)=>{
    let entityToGenerate = serverSystem.createEntity("entity", "mcbestudio:marker");
    serverSystem.applyComponentChanges(entityToGenerate,frame.positionComponent);
    serverSystem.applyComponentChanges(entityToGenerate,frame.rotationComponent);
    frame.entity = entityToGenerate;
  });
  serverSystem.executeCommand("/effect @e[type=mcbestudio:marker] fire_resistance 99999 255",(commandData:any) => commandCallback(commandData));
}

function onEntityHit(eventData:any){
  let currentClient:CurrentClient = connectedClientsdata[eventData.data.player.id];
  let hitEntity:IEntity = eventData.data.attacked_entity;
  if(currentClient.isPlacingKeyframe){
    if(serverSystem.hasComponent(hitEntity,"mcbestudio:triggerer")){
      let triggererComponent = serverSystem.getComponent<any>(hitEntity, "mcbestudio:triggerer");
      if(triggererComponent.data.role == "exit"){
        currentClient.isPlacingKeyframe = false;
        const placeEventData = serverSystem.createEventData("mcbestudio:exit_place_keyframe_mode");
        placeEventData.data.targetClient = eventData.data.player.id;
        serverSystem.broadcastEvent("mcbestudio:exit_place_keyframe_mode", placeEventData );
        currentClient.markers.forEach((marker:any) => {
          serverSystem.destroyEntity(marker);
        });
        currentClient.timeline.forEach((frame:any)=>{
          serverSystem.destroyEntity(frame.entity);
        });
      }else if(triggererComponent.data.role == "manageKeyframe"){
        generateKeyframe(currentClient);
        let keyframeEntity:any = generateMarker(currentClient, "§b Placer Keyframe",0,"manageKeyframe");
        keyframeEntity.angle = 0;
        currentClient.markers[1] = keyframeEntity;
      }
    }
  }
}

function getPositionAroundPlayer(targetEntity:any, playerPosition:any,playerRotation:any, radius:number,angle:number){
  let rotX = playerRotation.data.x;
  let rotY = playerRotation.data.y-angle;
  let posX = playerPosition.data.x;
  let posY = playerPosition.data.y;
  let posZ = playerPosition.data.z;
  let entityPosition = serverSystem.createComponent(targetEntity,MinecraftComponent.Position);
  entityPosition.data.x = posX - radius*Math.sin((Math.PI*rotY)/180)*Math.cos((Math.PI*rotX)/180);
  entityPosition.data.y = posY - radius*Math.sin((Math.PI*rotX)/180);
  entityPosition.data.z = posZ + radius*Math.cos((Math.PI*rotY)/180)*Math.cos((Math.PI*rotX)/180);
  return entityPosition;
}

function generateMarker(currentClient:CurrentClient, name:string,rotation:number, role:string){
  let playerPositionComponent = serverSystem.getComponent(currentClient.player, MinecraftComponent.Position);
  let playerRotationComponent = serverSystem.getComponent(currentClient.player, MinecraftComponent.Rotation);
  let entityToGenerate = serverSystem.createEntity("entity", "minecraft:armor_stand");
  let entityToGeneratePosition = getPositionAroundPlayer(entityToGenerate, playerPositionComponent,playerRotationComponent,4,rotation);
  serverSystem.applyComponentChanges(entityToGenerate,entityToGeneratePosition);
  let entityToGenerateName = serverSystem.createComponent(entityToGenerate,MinecraftComponent.Nameable);
  entityToGenerateName.data.name = name;
  entityToGenerateName.data.alwaysShow = true;
  entityToGenerateName.data.allowNameTagRenaming = false;
  serverSystem.applyComponentChanges(entityToGenerate,entityToGenerateName);
  let entityRole = serverSystem.createComponent<any>(entityToGenerate,"mcbestudio:triggerer");
  entityRole.data.role = role;
  serverSystem.applyComponentChanges(entityToGenerate,entityRole);
  return entityToGenerate;
  
}

function generateKeyframe(currentClient:CurrentClient){
  let playerPositionComponent = serverSystem.getComponent(currentClient.player, MinecraftComponent.Position);
  let playerRotationComponent = serverSystem.getComponent(currentClient.player, MinecraftComponent.Rotation);
  let entityToGenerate = serverSystem.createEntity("entity", "mcbestudio:marker");
  serverSystem.applyComponentChanges(entityToGenerate,playerPositionComponent);
  let keyFrameData = serverSystem.createComponent<any>(entityToGenerate,"mcbestudio:keyframe");
  keyFrameData.data.previous = currentClient.lastframe;
  let currentFrame = currentClient.counter;
  currentClient.counter +=1;
  keyFrameData.data.current = currentFrame;
  keyFrameData.data.next = -1;
  //On met à jour la liste chainée sur le précédent élément
  if(currentClient.lastframe !=-1){
    currentClient.timeline[currentClient.lastframe].next = currentFrame;
  }
  currentClient.lastframe = currentFrame
  currentClient.timeline[currentClient.lastframe] = keyFrameData.data;
  currentClient.timeline[currentClient.lastframe].entity = entityToGenerate;
  currentClient.timeline[currentClient.lastframe].positionComponent = playerPositionComponent;
  currentClient.timeline[currentClient.lastframe].rotationComponent = playerRotationComponent;
  currentClient.frameNumber++;
  let frameNumberEventdata = serverSystem.createEventData("mcbestudio:updateFrameNumber");
  frameNumberEventdata.data.frameNumber = currentClient.frameNumber;
  frameNumberEventdata.data.targetClient = currentClient.player.id;
  serverSystem.broadcastEvent("mcbestudio:updateFrameNumber",frameNumberEventdata);
  serverSystem.applyComponentChanges(entityToGenerate,keyFrameData);
  serverSystem.executeCommand("/effect @e[type=mcbestudio:marker] fire_resistance 99999 255",(commandData:any) => commandCallback(commandData));
  return entityToGenerate;
  
}

function goToFirstFrame(eventData:any){
  let currentClient:CurrentClient = connectedClientsdata[eventData.data.id];
  currentClient.currentPosition = 0;
  currentClient.currentKeyframe = currentClient.timeline.find((keyframe:any)=>keyframe.previous == -1);
  updatePositionPlayerFromFrame(currentClient);
}

function goToLastFrame(eventData:any){
  let currentClient:CurrentClient = connectedClientsdata[eventData.data.id];
  currentClient.currentPosition = currentClient.timelineExtended.length;
  currentClient.currentKeyframe = currentClient.timeline.find((keyframe:any)=>keyframe.next == -1);
  updatePositionPlayerFromFrame(currentClient);
}

function goToNextFrame(eventData:any){
  let currentClient:CurrentClient = connectedClientsdata[eventData.data.id];
  let newPosition:number = (Math.trunc(currentClient.currentPosition/frameRate)+1)*frameRate
  currentClient.currentPosition = newPosition;
  let newCurrentKeyframeid = currentClient.currentKeyframe.next;
  currentClient.currentKeyframe = currentClient.timeline[newCurrentKeyframeid];
  updatePositionPlayerFromFrame(currentClient);
}

function goToPreviousFrame(eventData:any){
  let currentClient:CurrentClient = connectedClientsdata[eventData.data.id];
  let newPosition:number = (Math.trunc(currentClient.currentPosition/frameRate)-1)*frameRate
  currentClient.currentPosition = newPosition;
  let newCurrentKeyframeid = currentClient.currentKeyframe.previous;
  currentClient.currentKeyframe = currentClient.timeline[newCurrentKeyframeid];
  updatePositionPlayerFromFrame(currentClient);
}

function goToPlay(eventData:any){
  let currentClient:CurrentClient = connectedClientsdata[eventData.data.id];
  if(eventData.data.isFullScreen == true){
    currentClient.isPlayingSequenceFullScreen = true;
  }else{
    currentClient.isPlayingSequenceFullScreen = false;
  }
  currentClient.isPlayingSequence = true;
}

function goToPause(eventData:any){
  let currentClient:CurrentClient = connectedClientsdata[eventData.data.id];
  currentClient.isPlayingSequence = false;
}

function processMarkersUpdate(clientConnected:any){
  //On récupère la position et la rotation
  let playerPositionComponent = serverSystem.getComponent(clientConnected.player, MinecraftComponent.Position);
  let playerRotationComponent = serverSystem.getComponent(clientConnected.player, MinecraftComponent.Rotation);
  if(playerPositionComponent.data.x != clientConnected.posX || playerPositionComponent.data.y != clientConnected.posY || playerPositionComponent.data.z != clientConnected.posZ){
    //On met à jour les dernières infos de position connues
    clientConnected.posX = playerPositionComponent.data.x;
    clientConnected.posY = playerPositionComponent.data.y;
    clientConnected.posZ = playerPositionComponent.data.z;
    clientConnected.rotX = playerRotationComponent.data.x-10; //To put the marker a bit above
    clientConnected.rotY = playerRotationComponent.data.y;
    //On parcours tous les markers associés au joueur
    clientConnected.markers.forEach((marker:any) => {
      //On récupère leur position
      let entityPosition = serverSystem.getComponent(marker,MinecraftComponent.Position);
      //On calcule la position relative par rapport au joueur
      entityPosition.data.x = clientConnected.posX - 5*Math.sin((Math.PI*(clientConnected.rotY-marker.angle))/180)*Math.cos((Math.PI*clientConnected.rotX)/180);
      entityPosition.data.y = clientConnected.posY - 5*Math.sin((Math.PI*clientConnected.rotX)/180);
      entityPosition.data.z = clientConnected.posZ + 5*Math.cos((Math.PI*(clientConnected.rotY-marker.angle))/180)*Math.cos((Math.PI*clientConnected.rotX)/180);
      //On set la position
      serverSystem.applyComponentChanges(marker,entityPosition);
    }
    );
    if(clientConnected.frameNumber>=2){
      let lastFrameObject:any = clientConnected.timeline[clientConnected.lastframe];
      let preLastFrame:any = clientConnected.timeline[lastFrameObject.previous];
      let previousDistance:number = Math.sqrt(Math.pow(lastFrameObject.positionComponent.data.x-preLastFrame.positionComponent.data.x,2)+Math.pow(lastFrameObject.positionComponent.data.y-preLastFrame.positionComponent.data.y,2)+Math.pow(lastFrameObject.positionComponent.data.z-preLastFrame.positionComponent.data.z,2));
      let currentDistance:number = Math.sqrt(Math.pow(lastFrameObject.positionComponent.data.x-clientConnected.posX,2)+Math.pow(lastFrameObject.positionComponent.data.y-clientConnected.posY,2)+Math.pow(lastFrameObject.positionComponent.data.z-clientConnected.posZ,2));
      let entityToGenerateName = serverSystem.createComponent(clientConnected.markers[1],MinecraftComponent.Nameable);
      if(previousDistance !== currentDistance){
        entityToGenerateName.data.name = "§b Place Keyframe (" +Math.round((previousDistance/currentDistance)*100)/100 + ")";
      }else{
        entityToGenerateName.data.name = "§b Place Keyframe (infinity)";
      }
      
      entityToGenerateName.data.alwaysShow = true;
      entityToGenerateName.data.allowNameTagRenaming = false;
      serverSystem.applyComponentChanges(clientConnected.markers[1],entityToGenerateName);
    }
  }else{
    //Sinon, on met juste à jour les données de position du joueur
    clientConnected.posX = playerPositionComponent.data.x;
    clientConnected.posY = playerPositionComponent.data.y;
    clientConnected.posZ = playerPositionComponent.data.z;
    clientConnected.rotX = playerRotationComponent.data.x;
    clientConnected.rotY = playerRotationComponent.data.y;
  }
}


function displayCurrentComponents(currentClient:CurrentClient){
  if(currentClient.timelineExtended[currentClient.currentPosition]){
    serverSystem.applyComponentChanges(currentClient.player,currentClient.timelineExtended[currentClient.currentPosition].positionComponent);
    serverSystem.applyComponentChanges(currentClient.player,currentClient.timelineExtended[currentClient.currentPosition].rotationComponent);
    currentClient.currentPosition++;
    let notifyCurrentFrameEventData:any = serverSystem.createEventData("mcbestudio:notifyCurrentFrame");
    notifyCurrentFrameEventData.data.targetClient = currentClient.player.id;
    notifyCurrentFrameEventData.data.currentFrame = currentClient.currentPosition;
    serverSystem.broadcastEvent("mcbestudio:notifyCurrentFrame",notifyCurrentFrameEventData);
  }else{
    currentClient.isPlayingSequence = false;
    if(currentClient.isPlayingSequenceFullScreen){
      currentClient.isPlayingSequenceFullScreen = false;
      let leaveFullScreenEventData:any = serverSystem.createEventData("mcbestudio:leaveFullScreen");
      leaveFullScreenEventData.data.targetClient = currentClient.player.id;
      serverSystem.broadcastEvent("mcbestudio:leaveFullScreen",leaveFullScreenEventData);
    }else{
      let notifySequenceEndedEventData:any = serverSystem.createEventData("mcbestudio:notifySequenceEnded");
      notifySequenceEndedEventData.data.targetClient = currentClient.player.id;
      serverSystem.broadcastEvent("mcbestudio:notifySequenceEnded",notifySequenceEndedEventData);
    }
  }
}

function generateSequence(eventData:any){
  let currentClient:CurrentClient = connectedClientsdata[eventData.data.id];
  if(currentClient.timeline.length>0){
    let openModalEventData:any = serverSystem.createEventData("mcbestudio:openModal");
    openModalEventData.data.targetClient = eventData.data.id;
    serverSystem.broadcastEvent("mcbestudio:openModal", openModalEventData);
  }
}

function deleteSequence(eventData:any){
  let currentClient:CurrentClient = connectedClientsdata[eventData.data.id];
  initClientTimelineData(currentClient);
}

function progressBarOpened(eventData:any){
  let currentClient:CurrentClient = connectedClientsdata[eventData.data.clientId];
  let updateModalEventData:any = serverSystem.createEventData("mcbestudio:updateModalValue");
  updateModalEventData.data.targetClient = eventData.data.clientId;
  let px:Array<number> = new Array();
  let py:Array<number> = new Array();
  let pz:Array<number> = new Array();
  let rx:Array<number> = new Array();
  let ry:Array<number> = new Array();
  updateModalEventData.data.currentState = 10;
  serverSystem.broadcastEvent("mcbestudio:updateModalValue", updateModalEventData);  
  let currentKeyframe:any = currentClient.timeline.find((keyframe:any)=>keyframe.previous == -1);
  let next:number = currentKeyframe["current"];
  while(currentKeyframe.next !=-1){
    currentKeyframe = currentClient.timeline[next];
    px.push(currentKeyframe.positionComponent.data.x);
    py.push(currentKeyframe.positionComponent.data.y);
    pz.push(currentKeyframe.positionComponent.data.z);
    rx.push(currentKeyframe.rotationComponent.data.x);
    ry.push(currentKeyframe.rotationComponent.data.y);
    next = currentKeyframe.next;
  }
  updateModalEventData.data.currentState = 30;
  serverSystem.broadcastEvent("mcbestudio:updateModalValue", updateModalEventData);  
  let pxe:Array<number> = subdiviseIntervals(px,frameRate);
  updateModalEventData.data.currentState = 40;
  serverSystem.broadcastEvent("mcbestudio:updateModalValue", updateModalEventData);  
  let pye:Array<number> = subdiviseIntervals(py,frameRate);
  updateModalEventData.data.currentState = 50;
  serverSystem.broadcastEvent("mcbestudio:updateModalValue", updateModalEventData);  
  let pze:Array<number> = subdiviseIntervals(pz,frameRate);
  updateModalEventData.data.currentState = 60;
  serverSystem.broadcastEvent("mcbestudio:updateModalValue", updateModalEventData);  
  let rxe:Array<number> = subdiviseIntervals(rx,frameRate);
  updateModalEventData.data.currentState = 70;
  serverSystem.broadcastEvent("mcbestudio:updateModalValue", updateModalEventData); 
  let rye:Array<number> = subdiviseIntervalsRotY(ry,frameRate);
  updateModalEventData.data.currentState = 80;
  serverSystem.broadcastEvent("mcbestudio:updateModalValue", updateModalEventData);  
  let i:number = 0;
  while(pxe[i]){
    
    let positionComponent = serverSystem.getComponent(currentClient.player, MinecraftComponent.Position);
    let rotationComponent = serverSystem.getComponent(currentClient.player, MinecraftComponent.Rotation);
    positionComponent.data.x = pxe[i];
    positionComponent.data.y = pye[i];
    positionComponent.data.z = pze[i];
    rotationComponent.data.x = rxe[i];
    rotationComponent.data.y = rye[i];
    currentClient.timelineExtended[i] = {
        positionComponent,
        rotationComponent
    };
    i++;
  }
  updateModalEventData.data.currentState = 90;
  serverSystem.broadcastEvent("mcbestudio:updateModalValue", updateModalEventData);
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
  updateModalEventData.data.currentState = 100;
  serverSystem.broadcastEvent("mcbestudio:updateModalValue", updateModalEventData);
  let closeModalEventData:any = serverSystem.createEventData("mcbestudio:closeModal");
  closeModalEventData.data.targetClient = eventData.data.clientId;
  serverSystem.broadcastEvent("mcbestudio:closeModal",closeModalEventData );
}








function subdiviseIntervals(array:Array<number>,slices:number){
  let newArray:Array<number> = new Array();
  let i:number = 0;
  while(array[i] && array[i+1]){
    let delta:number = array[i+1] - array[i];
    let subInterval:number = delta/slices;
    let p:number = 0;
    while(p!=slices-1){
      newArray.push(array[i] + (p*subInterval));
      p++;
    }
    i++;
  }
  if(array[i]){
    newArray.push(array[i]);
  }
  return newArray;
  
}

//Cas particulier de la rotation y pour prendre en compte le passage -180/0
function subdiviseIntervalsRotY(array:Array<number>,slices:number){
  let newArray:Array<number> = new Array();
  let cosArray:Array<number> = new Array();
  let sinArray:Array<number> = new Array();
  for(let i = 0;i<array.length;i++){
    cosArray[i] = Math.cos((Math.PI*array[i])/180);
    sinArray[i] = Math.sin((Math.PI*array[i])/180);
  }
  let cosArrayUpdated:Array<number> = subdiviseIntervals(cosArray,slices);
  let sinArrayUpdated:Array<number> = subdiviseIntervals(sinArray,slices);
  for(let i = 0;i<cosArrayUpdated.length;i++){
    if(cosArrayUpdated[i] === 0){
      if(sinArrayUpdated[i] === 1){
        newArray[i] = 90;
      }else{
        newArray[i] = -90;
      }
    }else{
      if(cosArrayUpdated[i]>0){
        newArray[i] = (Math.atan(sinArrayUpdated[i]/cosArrayUpdated[i])*180)/Math.PI;
      }else{
        newArray[i] = 180-(Math.atan(-sinArrayUpdated[i]/cosArrayUpdated[i])*180)/Math.PI;
      }
    }
  }
  return newArray;
  
}

function updatePositionPlayerFromFrame(currentClient:CurrentClient){
  if(currentClient.currentKeyframe){
    serverSystem.applyComponentChanges(currentClient.player,currentClient.currentKeyframe.positionComponent);
    serverSystem.applyComponentChanges(currentClient.player,currentClient.currentKeyframe.rotationComponent);
  }
}

function initClientTimelineData(currentClient:CurrentClient){
  currentClient.markers = new Array(); //Permet de stocker les markers
  currentClient.timeline = new Array(); //Permet de stocker la timeline
  currentClient.lastframe = -1; //Permet de connaitre l'ID de la dernière frame sauvegardée. Vaut -1 si aucune sauvegardée
  currentClient.counter = 0; //Compteur incrémental assignant un ID aux nouvelles frames
  currentClient.currentPosition = 0; //Indique le numéro de frame courante, incrémental peu importe les id (utile pour la timeline)
  currentClient.frameNumber = 0; //Nombre total de frame(utile pour la timeline)
  currentClient.currentKeyframe = null; //Indique la keyframe courante
  currentClient.isPlayingSequence = false; //Notify if the client is playing the sequence
  currentClient.isPlayingSequenceFullScreen = false; //Notify if the client is playing the sequence full screen
  currentClient.timelineExtended = new Array(); //Permet de stocker la timeline "complète" avec toute les transitions
}






















console.log = function(object:any){
    if(object instanceof Object){
      chat(JSON.stringify(object));
    }else{
      chat(object);
    }
  }
function commandCallback(commandData:any) {
  //Used to debug command calls
};

function chat(chat:string) {
    var event = serverSystem.createEventData('minecraft:display_chat_event');
    event.data.message = chat;
    serverSystem.broadcastEvent('minecraft:display_chat_event', event);
  };

}