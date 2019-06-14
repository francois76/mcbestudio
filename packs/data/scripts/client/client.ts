/// <reference types="minecraft-scripting-types-Client" />

import { CustomConsole } from "../Utils/CustomConsole";


namespace Client {
  const clientSystem = client.registerSystem(0, 0);
  let clientId: number;
  let frameNumber: number = 0;
  const console: CustomConsole = new CustomConsole(clientSystem);
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

  const wallOffameOptions = {
    path: 'wallOfFame.html', options: {
      always_accepts_input: false,
      render_game_behind: true,
      absorbs_input: true,
      is_showing_menu: false,
      should_steal_mouse: false,
      force_render_below: false,
      render_only_when_topmost: false
    }
  }

  // init listeners
  clientSystem.initialize = function () {
    console.initLogger();
    clientSystem.listenForEvent("minecraft:ui_event", (eventData) => onUIMessage(eventData));
    clientSystem.listenForEvent('minecraft:client_entered_world', (eventData) => onEnterWorld(eventData));
    clientSystem.listenForEvent('mcbestudio:exit_place_keyframe_mode', (eventData) => onClientExitKeyFrameMode(eventData));
    clientSystem.listenForEvent("mcbestudio:updateFrameNumber", (eventData) => updateFrameNumberUi(eventData));
    clientSystem.listenForEvent("mcbestudio:openModal", (eventData) => openModal(eventData));
    clientSystem.listenForEvent("mcbestudio:closeModal", (eventData) => closeModal(eventData));
    clientSystem.listenForEvent("mcbestudio:updateModalValue", (eventData) => updateModal(eventData));
    clientSystem.listenForEvent("mcbestudio:leaveFullScreen", (eventData) => leaveFullScreen(eventData));
    clientSystem.listenForEvent("mcbestudio:notifySequenceEnded", (eventData) => notifySequenceEnded(eventData));
    clientSystem.listenForEvent("mcbestudio:notifyCurrentFrame", (eventData) => notifyCurrentFrame(eventData));
    clientSystem.registerEventData("mcbestudio:enter_place_keyframe_mode", {});
    clientSystem.registerEventData("mcbestudio:client_entered_world", {});
    clientSystem.registerEventData("mcbestudio:generate_sequence", {});
    clientSystem.registerEventData("mcbestudio:delete_sequence", {});
    clientSystem.registerEventData("mcbestudio:go_to_first_frame", {});
    clientSystem.registerEventData("mcbestudio:go_to_last_frame", {});
    clientSystem.registerEventData("mcbestudio:go_to_next_frame", {});
    clientSystem.registerEventData("mcbestudio:go_to_previous_frame", {});
    clientSystem.registerEventData("mcbestudio:go_to_play", { isFullScreen: false });
    clientSystem.registerEventData("mcbestudio:go_to_pause", {});
    clientSystem.registerEventData("mcbestudio:updateFrameNumberUi", { frameNumber: 0 });
    clientSystem.registerEventData("mcbestudio:progressBarOpened", { clientId: 0 });
  };


  function chat(chat: string) {
    var event = clientSystem.createEventData('minecraft:display_chat_event');
    event.data.message = chat;
    clientSystem.broadcastEvent('minecraft:display_chat_event', event);
  };

  // a small helper to handle the (little annoying) new eventData handlers
  function handleEventData(event: any, data: any) {
    var eventData: IEventData<any> = clientSystem.createEventData(event);
    eventData.data = data;
    return eventData;
  };




  function onUIMessage(eventDataObject: IEventData<any>) {
    let eventData = eventDataObject.data;
    if (!eventData) {
      return;
    } else if (eventData === "modStarted") {
      onModStarted();
    } else if (eventData === "modExit") {
      onModExit();
    } else if (eventData === "enterPlaceKeyframeMode") {
      onEnterPlaceKeyframeMode();
    } else if (eventData === "generateSequence") {
      onSequenceGeneration();
    } else if (eventData === "firstFrame") {
      goToFirstFrame();
    } else if (eventData === "previousFrame") {
      goToPreviousFrame();
    } else if (eventData === "nextFrame") {
      goToNextFrame();
    } else if (eventData === "lastFrame") {
      goToLastFrame();
    } else if (eventData === "indexUiOpened") {
      indexUiOpened();
    } else if (eventData === "play") {
      goToPlay();
    } else if (eventData === "pause") {
      goToPause();
    } else if (eventData === "playFull") {
      goToPlayFull();
    } else if (eventData === "progressBarOpened") {
      progressBarOpened();
    } else if (eventData === "deleteSequence") {
      onDeleteSequence();
    } else if (eventData === "wallOfFameButton") {
      goToWallOfFame();
    } else if (eventData === "backButtonWallOfFame") {
      goToBackButtonWallOfFame();
    } else {
      console.log(eventData);
    }
  };

  function onEnterWorld(eventDataObject: any) {
    clientId = eventDataObject.data.player.id;
    var loadUiEvent: IEventData<ILoadUIParameters> = handleEventData('minecraft:load_ui', initUiOptions
    );
    clientSystem.broadcastEvent("mcbestudio:client_entered_world", eventDataObject);
    clientSystem.broadcastEvent('minecraft:load_ui', loadUiEvent);
  };

  function onModStarted() {
    var loadUiEvent = handleEventData('minecraft:load_ui', indexUiOptions);
    clientSystem.broadcastEvent('minecraft:load_ui', loadUiEvent);
  };

  function onModExit() {
    let unloadEventData: IEventData<IUnloadUIParameters> = clientSystem.createEventData("minecraft:unload_ui");
    unloadEventData.data.path = "index.html";
    clientSystem.broadcastEvent("minecraft:unload_ui", unloadEventData);
  };


  function onEnterPlaceKeyframeMode() {
    let unloadEventData: IEventData<IUnloadUIParameters> = clientSystem.createEventData("minecraft:unload_ui");
    unloadEventData.data.path = "index.html";
    clientSystem.broadcastEvent("minecraft:unload_ui", unloadEventData);
    let keyFrameModeEventData = clientSystem.createEventData("mcbestudio:enter_place_keyframe_mode");
    keyFrameModeEventData.data = new Object();
    keyFrameModeEventData.data.id = clientId;
    clientSystem.broadcastEvent("mcbestudio:enter_place_keyframe_mode", keyFrameModeEventData);
  };

  function onClientExitKeyFrameMode(eventData: IEventData<any>) {
    if (eventData.data.targetClient == clientId) {
      var loadUiEvent = handleEventData('minecraft:load_ui', indexUiOptions);
      clientSystem.broadcastEvent('minecraft:load_ui', loadUiEvent);
    }
  }


  function onSequenceGeneration() {
    let eventData = clientSystem.createEventData("mcbestudio:generate_sequence");
    eventData.data = new Object();
    eventData.data.id = clientId;
    clientSystem.broadcastEvent("mcbestudio:generate_sequence", eventData);
  }

  function onDeleteSequence() {
    let eventData = clientSystem.createEventData("mcbestudio:delete_sequence");
    eventData.data = new Object();
    eventData.data.id = clientId;
    clientSystem.broadcastEvent("mcbestudio:delete_sequence", eventData);
  }

  function goToFirstFrame() {
    let eventData = clientSystem.createEventData("mcbestudio:go_to_first_frame");
    eventData.data = new Object();
    eventData.data.id = clientId;
    clientSystem.broadcastEvent("mcbestudio:go_to_first_frame", eventData);
  }

  function goToLastFrame() {
    let eventData = clientSystem.createEventData("mcbestudio:go_to_last_frame");
    eventData.data = new Object();
    eventData.data.id = clientId;
    clientSystem.broadcastEvent("mcbestudio:go_to_last_frame", eventData);
  }

  function goToNextFrame() {
    let eventData = clientSystem.createEventData("mcbestudio:go_to_next_frame");
    eventData.data = new Object();
    eventData.data.id = clientId;
    clientSystem.broadcastEvent("mcbestudio:go_to_next_frame", eventData);
  }

  function goToPreviousFrame() {
    let eventData = clientSystem.createEventData("mcbestudio:go_to_previous_frame");
    eventData.data = new Object();
    eventData.data.id = clientId;
    clientSystem.broadcastEvent("mcbestudio:go_to_previous_frame", eventData);
  }

  function indexUiOpened() {
    let uiEventData = clientSystem.createEventData("minecraft:send_ui_event");
    uiEventData.data.eventIdentifier = "mcbestudio:updateFrameNumberUi";
    uiEventData.data.data = frameNumber;
    clientSystem.broadcastEvent("minecraft:send_ui_event", uiEventData);
  }

  function updateFrameNumberUi(eventData: IEventData<any>) {
    if (eventData.data.targetClient == clientId) {
      frameNumber = eventData.data.frameNumber;
    }
  }

  function goToPlay() {
    let eventData = clientSystem.createEventData("mcbestudio:go_to_play");
    eventData.data = new Object();
    eventData.data.id = clientId;
    eventData.data.isFullScreen = false;
    clientSystem.broadcastEvent("mcbestudio:go_to_play", eventData);
  }

  function goToPause() {
    let eventData = clientSystem.createEventData("mcbestudio:go_to_pause");
    eventData.data = new Object();
    eventData.data.id = clientId;
    clientSystem.broadcastEvent("mcbestudio:go_to_pause", eventData);
  }

  function goToPlayFull() {
    var loadUiEvent = handleEventData('minecraft:load_ui', blankScreenOptions
    );
    clientSystem.broadcastEvent('minecraft:load_ui', loadUiEvent);
    let eventData = clientSystem.createEventData("mcbestudio:go_to_play");
    eventData.data = new Object();
    eventData.data.id = clientId;
    eventData.data.isFullScreen = true;
    clientSystem.broadcastEvent("mcbestudio:go_to_play", eventData);
  }

  function goToWallOfFame() {
    var loadUiEvent = handleEventData('minecraft:load_ui', wallOffameOptions);
    clientSystem.broadcastEvent('minecraft:load_ui', loadUiEvent);
  }

  function goToBackButtonWallOfFame() {
    let unloadEventData = clientSystem.createEventData("minecraft:unload_ui");
    unloadEventData.data.path = "wallOfFame.html";
    clientSystem.broadcastEvent("minecraft:unload_ui", unloadEventData);
  }

  function openModal(eventData: IEventData<any>) {
    if (eventData.data.targetClient == clientId) {
      var loadUiEvent = handleEventData('minecraft:load_ui', progressBarOptions);
      clientSystem.broadcastEvent('minecraft:load_ui', loadUiEvent);
    }
  }


  function closeModal(eventData: IEventData<any>) {
    if (eventData.data.targetClient == clientId) {
      let unloadEventData = clientSystem.createEventData("minecraft:unload_ui");
      unloadEventData.data.path = "progressBar.html";
      clientSystem.broadcastEvent("minecraft:unload_ui", unloadEventData);
    }
  }


  function updateModal(eventData: IEventData<any>) {
    if (eventData.data.targetClient == clientId) {
      let uiEventData = clientSystem.createEventData("minecraft:send_ui_event");
      uiEventData.data.eventIdentifier = "mcbestudio:updateModal";
      uiEventData.data.data = eventData.data.currentState;
      clientSystem.broadcastEvent("minecraft:send_ui_event", uiEventData);
    }
  }

  function leaveFullScreen(eventData: IEventData<any>) {
    if (eventData.data.targetClient == clientId) {
      let unloadEventData = clientSystem.createEventData("minecraft:unload_ui");
      unloadEventData.data.path = "blank.html";
      clientSystem.broadcastEvent("minecraft:unload_ui", unloadEventData);
    }
  }

  function notifySequenceEnded(eventData: IEventData<any>) {
    if (eventData.data.targetClient == clientId) {
      let uiEventData = clientSystem.createEventData("minecraft:send_ui_event");
      uiEventData.data.eventIdentifier = "mcbestudio:switchPlayToPause";
      clientSystem.broadcastEvent("minecraft:send_ui_event", uiEventData);
    }
  }

  function notifyCurrentFrame(eventData: IEventData<any>) {
    if (eventData.data.targetClient == clientId) {
      let uiEventData = clientSystem.createEventData("minecraft:send_ui_event");
      uiEventData.data.eventIdentifier = "mcbestudio:notifyCurrentFrame";
      uiEventData.data.data = eventData.data.currentFrame;
      clientSystem.broadcastEvent("minecraft:send_ui_event", uiEventData);
    }
  }

  function progressBarOpened() {
    let progressBarOpenedEventData: IEventData<any> = clientSystem.createEventData("mcbestudio:progressBarOpened");
    progressBarOpenedEventData.data.id = clientId;
    clientSystem.broadcastEvent("mcbestudio:progressBarOpened", progressBarOpenedEventData)
  }




}