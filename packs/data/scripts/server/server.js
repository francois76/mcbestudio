const serverSystem = server.registerSystem(0, 0);
const connectedClientsdata = new Array();
const console = new Object();

const frameRate = 240;

/**
* Initialisation du serveur
*/
serverSystem.initialize = function () {
  this.initLogger();
  this.listenForEvent("minecraft:player_attacked_entity", eventData => this.onEntityHit(eventData));
  this.listenForEvent("mcbestudio:client_entered_world", eventData => this.onClientEnteredWorld(eventData));
  this.listenForEvent("mcbestudio:enter_place_keyframe_mode", eventData => this.onClientEnteredKeyFrameMode(eventData));
  this.listenForEvent("mcbestudio:generate_sequence", eventData => this.generateSequence(eventData));
  this.listenForEvent("mcbestudio:go_to_first_frame", eventData => this.goToFirstFrame(eventData));
  this.listenForEvent("mcbestudio:go_to_last_frame", eventData => this.goToLastFrame(eventData));
  this.listenForEvent("mcbestudio:go_to_next_frame", eventData => this.goToNextFrame(eventData));
  this.listenForEvent("mcbestudio:go_to_previous_frame", eventData => this.goToPreviousFrame(eventData));
  this.listenForEvent("mcbestudio:go_to_play", eventData => this.goToPlay(eventData));
  this.listenForEvent("mcbestudio:go_to_pause", eventData => this.goToPause(eventData));
  this.registerEventData("mcbestudio:exit_place_keyframe_mode", {targetClient:0});
  this.registerEventData("mcbestudio:updateFrameNumber", {targetClient:0, frameNumber:0});
  this.registerEventData("mcbestudio:openModal", {targetClient:0});
  this.registerEventData("mcbestudio:closeModal", {targetClient:0});
  this.registerEventData("mcbestudio:updateModalValue", { targetClient:0, currentState:0});
  this.registerEventData("mcbestudio:leaveFullScreen", {targetClient:0});
  this.registerEventData("mcbestudio:notifySequenceEnded", {targetClient:0});
  this.registerEventData("mcbestudio:notifyCurrentFrame", {targetClient:0, currentFrame:0});
  this.registerComponent("mcbestudio:triggerer", { targetClient:0, role:""});
  this.registerComponent("mcbestudio:keyframe", { targetClient:0, previous:0, next:0, current:0});
};

/**
* Appelé à chaque tick
*/
serverSystem.update = function () {
  //Pour chaque client connecté
  connectedClientsdata.forEach(clientConnected => {
    //Si on est en mode "plaçage keyframe et que le joueur bouge"
    if(clientConnected.isPlacingKeyframe){
      this.processMarkersUpdate(clientConnected);
    }else if(clientConnected.isPlayingSequence){
      this.displayCurrentComponents(clientConnected);
    }
    
  });
};

/**
* Appelé lorsqu'un client se connecte au monde
*/
serverSystem.onClientEnteredWorld = function (eventData) {
  //On récupère la position et la rotation initiale du joueur
  let playerPositionComponent = this.getComponent(eventData.data.player, "minecraft:position");
  let playerRotationComponent = this.getComponent(eventData.data.player, "minecraft:rotation");
  //On initialise toute les infos de sauvegarde liées à un joueur
  connectedClientsdata[eventData.data.player.id] = new Object();
  connectedClientsdata[eventData.data.player.id].isPlacingKeyframe = false; //true si le joueur est en mode "placer des keyframe"
  connectedClientsdata[eventData.data.player.id].player = eventData.data.player; //Contient la référence du joueur
  connectedClientsdata[eventData.data.player.id].rotX = playerRotationComponent.data.x; //Position x du joueur
  connectedClientsdata[eventData.data.player.id].rotY = playerRotationComponent.data.y; //Position y du joueur
  connectedClientsdata[eventData.data.player.id].posX = playerPositionComponent.data.x; //Position z du joueur
  connectedClientsdata[eventData.data.player.id].posY = playerPositionComponent.data.y; //Rotation y du joueur
  connectedClientsdata[eventData.data.player.id].posZ = playerPositionComponent.data.z; //Rotation z du joueur
  connectedClientsdata[eventData.data.player.id].markers = new Array(); //Permet de stocker les markers
  connectedClientsdata[eventData.data.player.id].timeline = new Array(); //Permet de stocker la timeline
  connectedClientsdata[eventData.data.player.id].lastframe = -1; //Permet de connaitre l'ID de la dernière frame sauvegardée. Vaut -1 si aucune sauvegardée
  connectedClientsdata[eventData.data.player.id].counter = 0; //Compteur incrémental assignant un ID aux nouvelles frames
  connectedClientsdata[eventData.data.player.id].currentPosition = 0; //Indique le numéro de frame courante, incrémental peu importe les id (utile pour la timeline)
  connectedClientsdata[eventData.data.player.id].frameNumber = 0; //Nombre total de frame(utile pour la timeline)
  connectedClientsdata[eventData.data.player.id].currentKeyframe = null; //Indique la keyframe courante
  connectedClientsdata[eventData.data.player.id].isPlayingSequence = false; //Notify if the client is playing the sequence
  connectedClientsdata[eventData.data.player.id].isPlayingSequenceFullScreen = false; //Notify if the client is playing the sequence full screen
  connectedClientsdata[eventData.data.player.id].timelineExtended = new Array(); //Permet de stocker la timeline "complète" avec toute les transitions
};

serverSystem.onClientEnteredKeyFrameMode = function(eventData){
  currentClient = connectedClientsdata[eventData.data.id];
  currentClient.isPlacingKeyframe = true;
  let exitEntity = this.generateMarker(currentClient, "§cBack to menu",45,"exit");
  exitEntity.angle = 45;
  currentClient.markers[0] = exitEntity;
  
  let keyframeEntity = this.generateMarker(currentClient, "§b Place Keyframe",0,"manageKeyframe");
  keyframeEntity.angle = 0;
  currentClient.markers[1] = keyframeEntity;

  currentClient.timeline.forEach(frame=>{
    let entityToGenerate = this.createEntity("entity", "mcbestudio:marker");
    this.applyComponentChanges(entityToGenerate,frame.positionComponent);
    this.applyComponentChanges(entityToGenerate,frame.rotationComponent);
    frame.entity = entityToGenerate;
  });
  this.executeCommand("/effect @e[type=mcbestudio:marker] fire_resistance 99999 255",(commandData) => this.commandCallback(commandData));
}

serverSystem.onEntityHit = function(eventData){
  currentClient = connectedClientsdata[eventData.data.player.id];
  hitEntity = eventData.data.attacked_entity;
  if(currentClient.isPlacingKeyframe){
    if(this.hasComponent(hitEntity,"mcbestudio:triggerer")){
      let triggererComponent = this.getComponent(hitEntity, "mcbestudio:triggerer");
      if(triggererComponent.data.role == "exit"){
        currentClient.isPlacingKeyframe = false;
        const placeEventData = this.createEventData("mcbestudio:exit_place_keyframe_mode");
        placeEventData.data.targetClient = eventData.data.player.id;
        this.broadcastEvent("mcbestudio:exit_place_keyframe_mode", placeEventData );
        currentClient.markers.forEach(marker => {
          this.destroyEntity(marker);
        });
        currentClient.timeline.forEach(frame=>{
          this.destroyEntity(frame.entity);
        });
      }else if(triggererComponent.data.role == "manageKeyframe"){
        this.generateKeyframe(currentClient);
        let keyframeEntity = this.generateMarker(currentClient, "§b Placer Keyframe",0,"manageKeyframe");
        keyframeEntity.angle = 0;
        currentClient.markers[1] = keyframeEntity;
      }
    }
  }
}

serverSystem.getPositionAroundPlayer = function(targetEntity, playerPosition,playerRotation, radius,angle){
  let rotX = playerRotation.data.x;
  let rotY = playerRotation.data.y-angle;
  let posX = playerPosition.data.x;
  let posY = playerPosition.data.y;
  let posZ = playerPosition.data.z;
  let entityPosition = this.createComponent(targetEntity,"minecraft:position");
  entityPosition.data.x = posX - radius*Math.sin((Math.PI*rotY)/180)*Math.cos((Math.PI*rotX)/180);
  entityPosition.data.y = posY - radius*Math.sin((Math.PI*rotX)/180);
  entityPosition.data.z = posZ + radius*Math.cos((Math.PI*rotY)/180)*Math.cos((Math.PI*rotX)/180);
  return entityPosition;
}

serverSystem.generateMarker = function(currentClient, name,rotation, role){
  let playerPositionComponent = this.getComponent(currentClient.player, "minecraft:position");
  let playerRotationComponent = this.getComponent(currentClient.player, "minecraft:rotation");
  let entityToGenerate = this.createEntity("entity", "minecraft:armor_stand");
  let entityToGeneratePosition = this.getPositionAroundPlayer(entityToGenerate, playerPositionComponent,playerRotationComponent,4,rotation);
  this.applyComponentChanges(entityToGenerate,entityToGeneratePosition);
  let entityToGenerateName = this.createComponent(entityToGenerate,"minecraft:nameable");
  entityToGenerateName.data.name = name;
  entityToGenerateName.data.alwaysShow = true;
  entityToGenerateName.data.allowNameTagRenaming = false;
  this.applyComponentChanges(entityToGenerate,entityToGenerateName);
  let entityRole = this.createComponent(entityToGenerate,"mcbestudio:triggerer");
  entityRole.data.role = role;
  this.applyComponentChanges(entityToGenerate,entityRole);
  return entityToGenerate;
  
}

serverSystem.generateKeyframe = function(currentClient){
  let playerPositionComponent = this.getComponent(currentClient.player, "minecraft:position");
  let playerRotationComponent = this.getComponent(currentClient.player, "minecraft:rotation");
  let entityToGenerate = this.createEntity("entity", "mcbestudio:marker");
  this.applyComponentChanges(entityToGenerate,playerPositionComponent);
  let keyFrameData = this.createComponent(entityToGenerate,"mcbestudio:keyframe");
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
  let frameNumberEventdata = this.createEventData("mcbestudio:updateFrameNumber");
  frameNumberEventdata.data.frameNumber = currentClient.frameNumber;
  frameNumberEventdata.data.targetClient = currentClient.player.id;
  this.broadcastEvent("mcbestudio:updateFrameNumber",frameNumberEventdata);
  this.applyComponentChanges(entityToGenerate,keyFrameData);
  this.executeCommand("/effect @e[type=mcbestudio:marker] fire_resistance 99999 255",(commandData) => this.commandCallback(commandData));
  return entityToGenerate;
  
}

serverSystem.goToFirstFrame = function(eventData){
  currentClient = connectedClientsdata[eventData.data.id];
  currentClient.currentPosition = 0;
  currentClient.currentKeyframe = currentClient.timeline.find(keyframe=>keyframe.previous == -1);
  this.updatePositionPlayerFromFrame(currentClient);
}

serverSystem.goToLastFrame = function(eventData){
  currentClient = connectedClientsdata[eventData.data.id];
  currentClient.currentPosition = currentClient.timelineExtended.length;
  currentClient.currentKeyframe = currentClient.timeline.find(keyframe=>keyframe.next == -1);
  this.updatePositionPlayerFromFrame(currentClient);
}

serverSystem.goToNextFrame = function(eventData){
  currentClient = connectedClientsdata[eventData.data.id];
  newPosition = (Math.trunc(currentClient.currentPosition/frameRate)+1)*frameRate
  currentClient.currentPosition = newPosition;
  let newCurrentKeyframeid = currentClient.currentKeyframe.next;
  currentClient.currentKeyframe = currentClient.timeline[newCurrentKeyframeid];
  this.updatePositionPlayerFromFrame(currentClient);
}

serverSystem.goToPreviousFrame = function(eventData){
  currentClient = connectedClientsdata[eventData.data.id];
  newPosition = (Math.trunc(currentClient.currentPosition/frameRate)-1)*frameRate
  currentClient.currentPosition = newPosition;
  let newCurrentKeyframeid = currentClient.currentKeyframe.previous;
  currentClient.currentKeyframe = currentClient.timeline[newCurrentKeyframeid];
  this.updatePositionPlayerFromFrame(currentClient);
}

serverSystem.goToPlay = function(eventData){
  currentClient = connectedClientsdata[eventData.data.id];
  if(eventData.data.isFullScreen == true){
    currentClient.isPlayingSequenceFullScreen = true;
  }else{
    currentClient.isPlayingSequenceFullScreen = false;
  }
  currentClient.isPlayingSequence = true;
}

serverSystem.goToPause = function(eventData){
  currentClient = connectedClientsdata[eventData.data.id];
  currentClient.isPlayingSequence = false;
}

serverSystem.processMarkersUpdate = function(clientConnected){
  //On récupère la position et la rotation
  let playerPositionComponent = this.getComponent(clientConnected.player, "minecraft:position");
  let playerRotationComponent = this.getComponent(clientConnected.player, "minecraft:rotation");
  if(playerPositionComponent.data.x != clientConnected.posX || playerPositionComponent.data.y != clientConnected.posY || playerPositionComponent.data.z != clientConnected.posZ){
    //On met à jour les dernières infos de position connues
    clientConnected.posX = playerPositionComponent.data.x;
    clientConnected.posY = playerPositionComponent.data.y;
    clientConnected.posZ = playerPositionComponent.data.z;
    clientConnected.rotX = playerRotationComponent.data.x-10; //To put the marker a bit above
    clientConnected.rotY = playerRotationComponent.data.y;
    //On parcours tous les markers associés au joueur
    clientConnected.markers.forEach(marker => {
      //On récupère leur position
      let entityPosition = this.getComponent(marker,"minecraft:position");
      //On calcule la position relative par rapport au joueur
      entityPosition.data.x = clientConnected.posX - 5*Math.sin((Math.PI*(clientConnected.rotY-marker.angle))/180)*Math.cos((Math.PI*clientConnected.rotX)/180);
      entityPosition.data.y = clientConnected.posY - 5*Math.sin((Math.PI*clientConnected.rotX)/180);
      entityPosition.data.z = clientConnected.posZ + 5*Math.cos((Math.PI*(clientConnected.rotY-marker.angle))/180)*Math.cos((Math.PI*clientConnected.rotX)/180);
      //On set la position
      this.applyComponentChanges(marker,entityPosition);
    }
    );
    if(clientConnected.frameNumber>=2){
      lastFrameObject = clientConnected.timeline[clientConnected.lastframe];
      preLastFrame = clientConnected.timeline[lastFrameObject.previous];
      previousDistance = Math.sqrt(Math.pow(lastFrameObject.positionComponent.data.x-preLastFrame.positionComponent.data.x,2)+Math.pow(lastFrameObject.positionComponent.data.y-preLastFrame.positionComponent.data.y,2)+Math.pow(lastFrameObject.positionComponent.data.z-preLastFrame.positionComponent.data.z,2));
      currentDistance = Math.sqrt(Math.pow(lastFrameObject.positionComponent.data.x-clientConnected.posX,2)+Math.pow(lastFrameObject.positionComponent.data.y-clientConnected.posY,2)+Math.pow(lastFrameObject.positionComponent.data.z-clientConnected.posZ,2));
      let entityToGenerateName = this.createComponent(clientConnected.markers[1],"minecraft:nameable");
      if(previousDistance !== currentDistance){
        entityToGenerateName.data.name = "§b Place Keyframe (" +Math.round((previousDistance/currentDistance)*100)/100 + ")";
      }else{
        entityToGenerateName.data.name = "§b Place Keyframe (infinity)";
      }
      
      entityToGenerateName.data.alwaysShow = true;
      entityToGenerateName.data.allowNameTagRenaming = false;
      this.applyComponentChanges(clientConnected.markers[1],entityToGenerateName);
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


serverSystem.displayCurrentComponents = function(currentClient){
  if(currentClient.timelineExtended[currentClient.currentPosition]){
    this.applyComponentChanges(currentClient.player,currentClient.timelineExtended[currentClient.currentPosition].positionComponent);
    this.applyComponentChanges(currentClient.player,currentClient.timelineExtended[currentClient.currentPosition].rotationComponent);
    currentClient.currentPosition++;
    notifyCurrentFrameEventData = this.createEventData("mcbestudio:notifyCurrentFrame");
    notifyCurrentFrameEventData.data.targetClient = currentClient.player.id;
    notifyCurrentFrameEventData.data.currentFrame = currentClient.currentPosition;
    this.broadcastEvent("mcbestudio:notifyCurrentFrame",notifyCurrentFrameEventData);
  }else{
    currentClient.isPlayingSequence = false;
    if(currentClient.isPlayingSequenceFullScreen){
      currentClient.isPlayingSequenceFullScreen = false;
      leaveFullScreenEventData = this.createEventData("mcbestudio:leaveFullScreen");
      leaveFullScreenEventData.data.targetClient = currentClient.player.id;
      this.broadcastEvent("mcbestudio:leaveFullScreen",leaveFullScreenEventData);
    }else{
      notifySequenceEndedEventData = this.createEventData("mcbestudio:notifySequenceEnded");
      notifySequenceEndedEventData.data.targetClient = currentClient.player.id;
      this.broadcastEvent("mcbestudio:notifySequenceEnded",notifySequenceEndedEventData);
    }
  }
}

serverSystem.generateSequence = function(eventData){
  currentClient = connectedClientsdata[eventData.data.id];
  if(currentClient.timeline.length>0){
    openModalEventData = this.createEventData("mcbestudio:openModal");
    updateModalEventData = this.createEventData("mcbestudio:updateModalValue");
    updateModalEventData.data.targetClient = eventData.data.id;
    openModalEventData.data.targetClient = eventData.data.id;
    this.broadcastEvent("mcbestudio:openModal", openModalEventData);
    px = new Array();
    py = new Array();
    pz = new Array();
    rx = new Array();
    ry = new Array();
    updateModalEventData.data.currentState = 10;
    this.broadcastEvent("mcbestudio:updateModalValue", updateModalEventData);  
    currentKeyframe = currentClient.timeline.find(keyframe=>keyframe.previous == -1);
    next = currentKeyframe["current"];
    while(currentKeyframe.next !=-1){
      currentKeyframe = connectedClientsdata[eventData.data.id].timeline[next];
      px.push(currentKeyframe.positionComponent.data.x);
      py.push(currentKeyframe.positionComponent.data.y);
      pz.push(currentKeyframe.positionComponent.data.z);
      rx.push(currentKeyframe.rotationComponent.data.x);
      ry.push(currentKeyframe.rotationComponent.data.y);
      next = currentKeyframe.next;
    }
    updateModalEventData.data.currentState = 30;
    this.broadcastEvent("mcbestudio:updateModalValue", updateModalEventData);  
    pxe = this.subdiviseIntervals(px,frameRate);
    pye = this.subdiviseIntervals(py,frameRate);
    pze = this.subdiviseIntervals(pz,frameRate);
    rxe = this.subdiviseIntervals(rx,frameRate);
    rye = this.subdiviseIntervalsRotY(ry,frameRate);
    updateModalEventData.data.currentState = 60;
    this.broadcastEvent("mcbestudio:updateModalValue", updateModalEventData);  
    i = 0;
    while(pxe[i]){
      currentClient.timelineExtended[i] = new Object();
      let positionComponent = this.getComponent(currentClient.player, "minecraft:position");
      let rotationComponent = this.getComponent(currentClient.player, "minecraft:rotation");
      positionComponent.data.x = pxe[i];
      positionComponent.data.y = pye[i];
      positionComponent.data.z = pze[i];
      rotationComponent.data.x = rxe[i];
      rotationComponent.data.y = rye[i];
      currentClient.timelineExtended[i].positionComponent = positionComponent;
      currentClient.timelineExtended[i].rotationComponent = rotationComponent;
      i++;
    }
    updateModalEventData.data.currentState = 90;
    this.broadcastEvent("mcbestudio:updateModalValue", updateModalEventData);
    delete pxe;
    delete pye;
    delete pze;
    delete rxe;
    delete rye;
    delete px;
    delete py;
    delete pz;
    delete rx;
    delete ry;
    closeModalEventData = this.createEventData("mcbestudio:closeModal");
    closeModalEventData.data.targetClient = eventData.data.id;
    this.broadcastEvent("mcbestudio:closeModal",closeModalEventData );
  }
  
}








serverSystem.subdiviseIntervals = function(array,slices){
  newArray = new Array();
  i = 0;
  while(array[i] && array[i+1]){
    delta = array[i+1] - array[i];
    subInterval = delta/slices;
    p = 0;
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
serverSystem.subdiviseIntervalsRotY = function(array,slices){
  newArray = new Array();
  cosArray = new Array();
  sinArray = new Array();
  for(i = 0;i<array.length;i++){
    cosArray[i] = Math.cos((Math.PI*array[i])/180);
    sinArray[i] = Math.sin((Math.PI*array[i])/180);
  }
  cosArrayUpdated = this.subdiviseIntervals(cosArray,slices);
  sinArrayUpdated = this.subdiviseIntervals(sinArray,slices);
  for(i = 0;i<cosArrayUpdated.length;i++){
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

serverSystem.updatePositionPlayerFromFrame = function(currentClient){
  if(currentClient.currentKeyframe){
    this.applyComponentChanges(currentClient.player,currentClient.currentKeyframe.positionComponent);
    this.applyComponentChanges(currentClient.player,currentClient.currentKeyframe.rotationComponent);
  }
}






















console.log = function(object){
  if(object instanceof Object){
    serverSystem.chat(JSON.stringify(object));
  }else{
    serverSystem.chat(object);
  }
}
serverSystem.commandCallback = function (commandData) {
  //Used to debug command calls
};

//Permet d'appeler le chat
serverSystem.chat = function (chat) {
  var event = this.createEventData('minecraft:display_chat_event');
  event.data.message = chat;
  this.broadcastEvent('minecraft:display_chat_event', event);
};

//Permet d'initialiser le logger
serverSystem.initLogger = function () {
  var loggerEvent = this.createEventData('minecraft:script_logger_config');
  loggerEvent.data.log_errors = true;
  loggerEvent.data.log_warnings = true;
  loggerEvent.data.log_information = true;
  this.broadcastEvent('minecraft:script_logger_config', loggerEvent);
};
