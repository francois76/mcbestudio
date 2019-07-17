
// Get a handle to the scripting interface on creation.
// The script interface can trigger events to the client script
let scriptInterface = null;
scriptInterface = new Object();
scriptInterface.triggerEvent = function (a) { };
engine.on("facet:updated:core.scripting", function (interface) {
    scriptInterface = interface;
    scriptInterface.triggerEvent("indexUiOpened");
});

engine.trigger("facet:request", ["core.scripting"]);

isPlayButton = true;
suppressWarningTriggered = false;
keyFrameNumber = 0;
currentKeyFrame = 1;
timeLineIndex = 1;
rawTimeLineLength = 40;
readMode = false;

// Get each of the ability buttons
let exitButton = document.getElementById("exitButton");
let placeKeyframeButton = document.getElementById("placeKeyframeButton");
let generateSequenceButton = document.getElementById("generateSequenceButton");
let deleteSequenceButton = document.getElementById("deleteSequenceButton");
let playPauseButton = document.getElementById("playPauseButton");
let playFullButton = document.getElementById("playFullButton");
let firstFrameButton = document.getElementById("firstFrameButton");
let previousFrameButton = document.getElementById("previousFrameButton");
let nextFrameButton = document.getElementById("nextFrameButton");
let lastFrameButton = document.getElementById("lastFrameButton");
let wallOfFameButton = document.getElementById("wallOfFameButton");
let moveKeyframeButton = document.getElementById("moveKeyframeButton");
let deleteKeyframeButton = document.getElementById("deleteKeyframeButton");
let deleteAllKeyframesButton = document.getElementById("deleteAllKeyframesButton");
let cutButton = document.getElementById("cutButton");

// Callback to send the button event to the client script
let broadcastEvent = function (event) {
    scriptInterface.triggerEvent(event);
}

// Handle button presses on the ability buttons. Send a specific event for each ability button to the client script.
exitButton.addEventListener("click", function () {
    broadcastEvent("modExit");
});

placeKeyframeButton.addEventListener("click", function () {
    if (!readMode) {
        broadcastEvent("enterPlaceKeyframeMode");
    }
});

generateSequenceButton.addEventListener("click", function () {
    if (!readMode) {
        broadcastEvent("generateSequence");
    }
});

deleteSequenceButton.addEventListener("click", function () {
    if (readMode) {
        broadcastEvent("deleteSequence");
        readMode = false;
        switchToEditMode();
    }
});

playPauseButton.addEventListener("click", function () {
    if (readMode) {
        updateButtonImage();
        if (isPlayButton) {
            broadcastEvent("pause");
        } else {
            broadcastEvent("play");
        }
    }
});

playFullButton.addEventListener("click", function () {
    if (readMode) {
        setPlayToPause();
        broadcastEvent("playFull");
    }
});

firstFrameButton.addEventListener("click", function () {
    if (keyFrameNumber >= 2) {
        broadcastEvent("firstFrame");
    }
});

previousFrameButton.addEventListener("click", function () {
    if (keyFrameNumber >= 2 && currentKeyFrame > 1) {
        broadcastEvent("previousFrame");
    }
});

nextFrameButton.addEventListener("click", function () {
    if (keyFrameNumber >= 2 && currentKeyFrame < keyFrameNumber) {
        broadcastEvent("nextFrame");
    }
});

lastFrameButton.addEventListener("click", function () {
    if (keyFrameNumber >= 2) {
        broadcastEvent("lastFrame");
    }
});

wallOfFameButton.addEventListener("click", function () {
    broadcastEvent("wallOfFameButton");
});

moveKeyframeButton.addEventListener("click", function () {
    if (!readMode) {
        broadcastEvent("moveKeyframeButton");
    }
});

deleteKeyframeButton.addEventListener("click", function () {
    if (!readMode && keyFrameNumber > 0) {
        broadcastEvent("deleteKeyframeButton");
    }
});

deleteAllKeyframesButton.addEventListener("click", function () {
    if (!readMode && keyFrameNumber > 0) {
        updateKeyFrameNumber(0);
        document.getElementById("timeline").textContent = generateUpdatedTimeline();
        broadcastEvent("deleteAllKeyframesButton");
    }
});

cutButton.addEventListener("click", function () {
    if (!readMode) {
        broadcastEvent("cutButton");
    }
});

updateButtonImage = function () {
    if (isPlayButton) {
        playPauseButton.style.backgroundImage = 'url("../../assets/images/pause.png")';
        isPlayButton = false;
    } else {
        playPauseButton.style.backgroundImage = 'url("../../assets/images/play.png")';
        isPlayButton = true;
    }
}
setPlayToPause = function () {
    playPauseButton.style.backgroundImage = 'url("../../assets/images/pause.png")';
    isPlayButton = false;
}

generateUpdatedTimeline = function () {
    generatedTimeLine = "";
    if (keyFrameNumber === 0) {
        timelineIndex = -1;
    } else {
        timelineIndex = Math.floor((currentKeyFrame - 1) * ((rawTimeLineLength / (keyFrameNumber - 1))));
    }
    for (i = 0; i <= rawTimeLineLength; i++) {
        if (i === timelineIndex) {
            generatedTimeLine = generatedTimeLine + "O";
        } else {
            generatedTimeLine = generatedTimeLine + "-";
        }
    }
    return "[" + generatedTimeLine + "]";
}

updateKeyFrameNumber = function (keyFrameNumberServer) {
    keyFrameNumber = keyFrameNumberServer;
    if (keyFrameNumber == 0) {
        disableEditionButtons();
        disableNavigationButtons();
    } else if (keyFrameNumber == 1) {
        enableEditionButtons();
        disableNavigationButtons();
    } else {
        enableEditionButtons();
        enableNavigationButtons();
    }
}

switchToReadMode = function () {
    playPauseButton.classList.remove("disabled");
    playFullButton.classList.remove("disabled");
    deleteSequenceButton.classList.remove("disabled");
    placeKeyframeButton.classList.add("disabled");
    generateSequenceButton.classList.add("disabled");
    //moveKeyframeButton.classList.add("disabled");
    deleteKeyframeButton.classList.add("disabled");
    deleteAllKeyframesButton.classList.add("disabled");
    //cutButton = document.classList.add("disabled");
    broadcastEvent("switchToReadMode");
}

switchToEditMode = function () {
    playPauseButton.classList.add("disabled");
    playFullButton.classList.add("disabled");
    deleteSequenceButton.classList.add("disabled");
    placeKeyframeButton.classList.remove("disabled");
    generateSequenceButton.classList.remove("disabled");
    //moveKeyframeButton.classList.remove("disabled");
    deleteKeyframeButton.classList.remove("disabled");
    deleteAllKeyframesButton.classList.remove("disabled");
    //cutButton = document.classList.remove("disabled");
    broadcastEvent("switchToEditMode");
}

disableNavigationButtons = function () {
    lastFrameButton.classList.add("disabled");
    nextFrameButton.classList.add("disabled");
    previousFrameButton.classList.add("disabled");
    firstFrameButton.classList.add("disabled");
}

enableNavigationButtons = function () {
    lastFrameButton.classList.remove("disabled");
    nextFrameButton.classList.remove("disabled");
    previousFrameButton.classList.remove("disabled");
    firstFrameButton.classList.remove("disabled");
}

disableEditionButtons = function () {
    deleteKeyframeButton.classList.add("disabled1");
    deleteAllKeyframesButton.classList.add("disabled1");
}

enableEditionButtons = function () {
    deleteKeyframeButton.classList.remove("disabled1");
    deleteAllKeyframesButton.classList.remove("disabled1");
}


engine.on("mcbestudio:update_frame_number_ui", function (frameNumberEventdata) {
    updateKeyFrameNumber(frameNumberEventdata);
    document.getElementById("timeline").textContent = generateUpdatedTimeline();
});

engine.on("mcbestudio:switch_play_to_pause", function (eventdata) {
    updateButtonImage();
});

engine.on("mcbestudio:notify_current_frame", function (currentFrame) {
    currentKeyFrame = (currentFrame / 240) + 1;
    document.getElementById("timeline").textContent = generateUpdatedTimeline();
});

engine.on("mcbestudio:update_modal_value", function (newSize) {
    if (newSize == 100) {
        readMode = true;
        switchToReadMode();
    }
});

engine.on("mcbestudio:notify_current_mode", function (mode) {
    if (mode == "edit") {
        switchToEditMode();
    } else {
        switchToReadMode();
    }
});
