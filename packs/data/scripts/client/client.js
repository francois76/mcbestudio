const clientSystem = client.registerSystem(0, 0);
let clientId;
let frameNumber = 0;
const console = new Object();
const indexUiOptions = {
  path: 'index.html', options: {
    always_accepts_input: false,
    render_game_behind: true,
    absorbs_input: true,
    is_showing_menu: false,
    should_steal_mouse: false,
    force_render_below: false,
    render_only_when_topmost: false 
  } 
};
const initUiOptions = {
  path: 'init.html', options: {
    always_accepts_input: false,
    render_game_behind: true,
    absorbs_input: false,
    is_showing_menu: false,
    should_steal_mouse: true,
    force_render_below: true,
    render_only_when_topmost: true 
  } 
}

const blankScreenOptions = {
  path: 'blank.html', options: {
    always_accepts_input: false,
    render_game_behind: true,
    absorbs_input: true,
    is_showing_menu: false,
    should_steal_mouse: false,
    force_render_below: false,
    render_only_when_topmost: false 
  } 
}

const progressBarOptions = {
  path: 'progressBar.html', options: {
    always_accepts_input: false,
    render_game_behind: true,
    absorbs_input: false,
    is_showing_menu: false,
    should_steal_mouse: true,
    force_render_below: true,
    render_only_when_topmost: true 
  } 
}

// init listeners
clientSystem.initialize = function () {
  this.initLogger();
  this.listenForEvent("minecraft:ui_event", (eventData) => this.onUIMessage(eventData));
  this.listenForEvent('minecraft:client_entered_world', (eventData) => this.onEnterWorld(eventData));
  this.listenForEvent('mcbestudio:exit_place_keyframe_mode', (eventData) => this.onClientExitKeyFrameMode(eventData));
  this.listenForEvent("mcbestudio:updateFrameNumber",  (eventData) => this.updateFrameNumberUi(eventData));
  this.listenForEvent("mcbestudio:openModal",  (eventData) => this.openModal(eventData));
  this.listenForEvent("mcbestudio:closeModal",  (eventData) => this.closeModal(eventData));
  this.listenForEvent("mcbestudio:updateModalValue",  (eventData) => this.updateModal(eventData));
  this.listenForEvent("mcbestudio:leaveFullScreen",  (eventData) => this.leaveFullScreen(eventData));
  this.listenForEvent("mcbestudio:notifySequenceEnded",  (eventData) => this.notifySequenceEnded(eventData));
  this.listenForEvent("mcbestudio:notifyCurrentFrame",  (eventData) => this.notifyCurrentFrame(eventData));
  this.registerEventData("mcbestudio:enter_place_keyframe_mode", {});
  this.registerEventData("mcbestudio:client_entered_world", {});
  this.registerEventData("mcbestudio:generate_sequence", {});
  this.registerEventData("mcbestudio:delete_sequence", {});
  this.registerEventData("mcbestudio:go_to_first_frame", {});
  this.registerEventData("mcbestudio:go_to_last_frame", {});
  this.registerEventData("mcbestudio:go_to_next_frame", {});
  this.registerEventData("mcbestudio:go_to_previous_frame", {});
  this.registerEventData("mcbestudio:go_to_play", {isFullScreen:false});
  this.registerEventData("mcbestudio:go_to_pause", {});
  this.registerEventData("mcbestudio:updateFrameNumberUi", { frameNumber:0});
  this.registerEventData("mcbestudio:progressBarOpened", { clientId:0});
};


clientSystem.chat = function (chat) {
  var event = this.createEventData('minecraft:display_chat_event');
  event.data.message = chat;
  this.broadcastEvent('minecraft:display_chat_event', event);
};

// a small helper to handle the (little annoying) new eventData handlers
clientSystem.handleEventData = function (event, data) {
  var eventData = this.createEventData(event);
  eventData.data = data;
  return eventData;
};


clientSystem.initLogger = function () {
  var loggerEvent = this.createEventData('minecraft:script_logger_config');
  loggerEvent.data.log_errors = true;
  loggerEvent.data.log_warnings = true;
  loggerEvent.data.log_information = true;
  this.broadcastEvent('minecraft:script_logger_config', loggerEvent);
};

clientSystem.onUIMessage = function (eventDataObject) {
  let eventData = eventDataObject.data;
  if(!eventData) {
    return;
  }else if(eventData === "modStarted"){
    this.onModStarted();
  }else if(eventData === "modExit"){
    this.onModExit();
  }else if(eventData === "enterPlaceKeyframeMode"){
    this.onEnterPlaceKeyframeMode();
  }else if(eventData === "generateSequence"){
    this.onSequenceGeneration();
  }else if(eventData === "firstFrame"){
    this.goToFirstFrame();
  }else if(eventData === "previousFrame"){
    this.goToPreviousFrame();
  }else if(eventData === "nextFrame"){
    this.goToNextFrame();
  }else if(eventData === "lastFrame"){
    this.goToLastFrame();
  }else if(eventData === "indexUiOpened"){
    this.indexUiOpened();
  }else if(eventData === "play"){
    this.goToPlay();
  }else if(eventData === "pause"){
    this.goToPause();
  }else if(eventData === "playFull"){
    this.goToPlayFull();
  }else if(eventData === "progressBarOpened"){
    this.progressBarOpened();
  }else if(eventData === "deleteSequence"){
    this.onDeleteSequence();
  }else{
    console.log(eventData);
  }
};

clientSystem.onEnterWorld = function(eventDataObject){
  clientId = eventDataObject.data.player.id;
  var loadUiEvent = this.handleEventData('minecraft:load_ui', initUiOptions
  );
  this.broadcastEvent("mcbestudio:client_entered_world", eventDataObject);
  this.broadcastEvent('minecraft:load_ui', loadUiEvent);
};

clientSystem.onModStarted = function(){
  var loadUiEvent = this.handleEventData('minecraft:load_ui', indexUiOptions);
  this.broadcastEvent('minecraft:load_ui', loadUiEvent);
};

clientSystem.onModExit = function(){
  let unloadEventData = this.createEventData("minecraft:unload_ui");    
  unloadEventData.data.path = "index.html";
  this.broadcastEvent("minecraft:unload_ui", unloadEventData);
};


clientSystem.onEnterPlaceKeyframeMode = function(){
  let unloadEventData = this.createEventData("minecraft:unload_ui");    
  unloadEventData.data.path = "index.html";
  this.broadcastEvent("minecraft:unload_ui", unloadEventData);
  let keyFrameModeEventData = this.createEventData("mcbestudio:enter_place_keyframe_mode");
  keyFrameModeEventData.data = new Object(); 
  keyFrameModeEventData.data.id = clientId;
  this.broadcastEvent("mcbestudio:enter_place_keyframe_mode",keyFrameModeEventData);
};

clientSystem.onClientExitKeyFrameMode = function(eventData){
  if(eventData.data.targetClient == clientId){
    var loadUiEvent = this.handleEventData('minecraft:load_ui', indexUiOptions);
    this.broadcastEvent('minecraft:load_ui', loadUiEvent);
  }
}


clientSystem.onSequenceGeneration = function(){
  let eventData = this.createEventData("mcbestudio:generate_sequence");
  eventData.data = new Object(); 
  eventData.data.id = clientId;
  this.broadcastEvent("mcbestudio:generate_sequence",eventData);
}

clientSystem.onDeleteSequence = function(){
  let eventData = this.createEventData("mcbestudio:delete_sequence");
  eventData.data = new Object(); 
  eventData.data.id = clientId;
  this.broadcastEvent("mcbestudio:delete_sequence",eventData);
}

clientSystem.goToFirstFrame = function(){
  let eventData = this.createEventData("mcbestudio:go_to_first_frame");
  eventData.data = new Object(); 
  eventData.data.id = clientId;
  this.broadcastEvent("mcbestudio:go_to_first_frame",eventData);
}

clientSystem.goToLastFrame = function(){
  let eventData = this.createEventData("mcbestudio:go_to_last_frame");
  eventData.data = new Object(); 
  eventData.data.id = clientId;
  this.broadcastEvent("mcbestudio:go_to_last_frame",eventData);
}

clientSystem.goToNextFrame = function(){
  let eventData = this.createEventData("mcbestudio:go_to_next_frame");
  eventData.data = new Object(); 
  eventData.data.id = clientId;
  this.broadcastEvent("mcbestudio:go_to_next_frame",eventData);
}

clientSystem.goToPreviousFrame = function(){
  let eventData = this.createEventData("mcbestudio:go_to_previous_frame");
  eventData.data = new Object(); 
  eventData.data.id = clientId;
  this.broadcastEvent("mcbestudio:go_to_previous_frame",eventData);
}

clientSystem.indexUiOpened = function(){
  let uiEventData = this.createEventData("minecraft:send_ui_event");
  uiEventData.data.eventIdentifier = "mcbestudio:updateFrameNumberUi";
  uiEventData.data.data = this.frameNumber;
  this.broadcastEvent("minecraft:send_ui_event",uiEventData);
}

clientSystem.updateFrameNumberUi = function(eventData){
  if(eventData.data.targetClient == clientId){
    this.frameNumber = eventData.data.frameNumber;
  }
}

clientSystem.goToPlay = function(){
  let eventData = this.createEventData("mcbestudio:go_to_play");
  eventData.data = new Object(); 
  eventData.data.id = clientId;
  eventData.data.isFullScreen = false;
  this.broadcastEvent("mcbestudio:go_to_play",eventData);
}

clientSystem.goToPause = function(){
  let eventData = this.createEventData("mcbestudio:go_to_pause");
  eventData.data = new Object(); 
  eventData.data.id = clientId;
  this.broadcastEvent("mcbestudio:go_to_pause",eventData);
}

clientSystem.goToPlayFull = function(){
  var loadUiEvent = this.handleEventData('minecraft:load_ui', blankScreenOptions
  );
  this.broadcastEvent('minecraft:load_ui', loadUiEvent);
  let eventData = this.createEventData("mcbestudio:go_to_play");
  eventData.data = new Object(); 
  eventData.data.id = clientId;
  eventData.data.isFullScreen = true;
  this.broadcastEvent("mcbestudio:go_to_play",eventData);
}

clientSystem.openModal = function(eventData){
  if(eventData.data.targetClient == clientId){
    var loadUiEvent = this.handleEventData('minecraft:load_ui', progressBarOptions);
    this.broadcastEvent('minecraft:load_ui', loadUiEvent);
  }
}


clientSystem.closeModal = function(eventData){
  if(eventData.data.targetClient == clientId){
    let unloadEventData = this.createEventData("minecraft:unload_ui");    
    unloadEventData.data.path = "progressBar.html";
    this.broadcastEvent("minecraft:unload_ui", unloadEventData);
  }
}


clientSystem.updateModal = function(eventData){
  if(eventData.data.targetClient == clientId){
    let uiEventData = this.createEventData("minecraft:send_ui_event");
    uiEventData.data.eventIdentifier = "mcbestudio:updateModal";
    uiEventData.data.data = eventData.data.currentState;
    this.broadcastEvent("minecraft:send_ui_event",uiEventData);
  }
}

clientSystem.leaveFullScreen = function(eventData){
  if(eventData.data.targetClient == clientId){
    let unloadEventData = this.createEventData("minecraft:unload_ui");    
    unloadEventData.data.path = "blank.html";
    this.broadcastEvent("minecraft:unload_ui", unloadEventData);
  } 
}

clientSystem.notifySequenceEnded = function(eventData){
  if(eventData.data.targetClient == clientId){
    let uiEventData = this.createEventData("minecraft:send_ui_event");
    uiEventData.data.eventIdentifier = "mcbestudio:switchPlayToPause";
    this.broadcastEvent("minecraft:send_ui_event",uiEventData);
  } 
}

clientSystem.notifyCurrentFrame = function(eventData){
  if(eventData.data.targetClient == clientId){
    let uiEventData = this.createEventData("minecraft:send_ui_event");
    uiEventData.data.eventIdentifier = "mcbestudio:notifyCurrentFrame";
    uiEventData.data.data = eventData.data.currentFrame;
    this.broadcastEvent("minecraft:send_ui_event",uiEventData);
  } 
}

clientSystem.progressBarOpened = function(){
  progressBarOpenedEventData = this.createEventData("mcbestudio:progressBarOpened");
  progressBarOpenedEventData.data.clientId = clientId;
  this.broadcastEvent("mcbestudio:progressBarOpened",progressBarOpenedEventData)
}



console.log = function(object){
  if(object instanceof Object){
    clientSystem.chat(JSON.stringify(object));
  }else{
    clientSystem.chat(object);
  }
}

