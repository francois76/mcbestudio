
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
let cutButton = document.getElementById("cutButton");

// Callback to send the button event to the client script
let buttonCallback = function (event) {
    scriptInterface.triggerEvent(event);
}

// Handle button presses on the ability buttons. Send a specific event for each ability button to the client script.
exitButton.addEventListener("click", function () {
    buttonCallback("modExit");
});

placeKeyframeButton.addEventListener("click", function () {
    buttonCallback("enterPlaceKeyframeMode");
});

generateSequenceButton.addEventListener("click", function () {
    buttonCallback("generateSequence");
});

deleteSequenceButton.addEventListener("click", function () {
    if (suppressWarningTriggered) {
        updateKeyFrameNumber(0);
        document.getElementById("timeline").textContent = generateUpdatedTimeline();
        buttonCallback("deleteSequence");
        deleteSequenceButton.classList.remove('real-button');
        deleteSequenceButton.classList.add('delete-button-deleted');
        deleteSequenceButton.textContent = "Sequence deleted"
        readMode = false;
        suppressWarningTriggered = false;
    } else {
        deleteSequenceButton.classList.remove('real-button');
        deleteSequenceButton.classList.add('delete-button-confirm');
        deleteSequenceButton.textContent = "Click again to confirm"
        suppressWarningTriggered = true;
    }

});

deleteSequenceButton.addEventListener("mouseleave", function () {
    deleteSequenceButton.classList.remove('delete-button-confirm');
    deleteSequenceButton.classList.remove('delete-button-deleted');
    deleteSequenceButton.classList.add('real-button');
    deleteSequenceButton.textContent = "Delete sequence";
    suppressWarningTriggered = false;
});

playPauseButton.addEventListener("click", function () {
    if (readMode) {
        updateButtonImage();
        if (isPlayButton) {
            buttonCallback("pause");
        } else {
            buttonCallback("play");
        }
    }
});

playFullButton.addEventListener("click", function () {
    if (readMode) {
        setPlayToPause();
        buttonCallback("playFull");
    }
});

firstFrameButton.addEventListener("click", function () {
    buttonCallback("firstFrame");
});

previousFrameButton.addEventListener("click", function () {
    if (currentKeyFrame > 1) {
        buttonCallback("previousFrame");
    }
});

nextFrameButton.addEventListener("click", function () {
    if (currentKeyFrame < keyFrameNumber) {
        buttonCallback("nextFrame");
    }
});

lastFrameButton.addEventListener("click", function () {
    buttonCallback("lastFrame");
});

wallOfFameButton.addEventListener("click", function () {
    buttonCallback("wallOfFameButton");
});

moveKeyframeButton.addEventListener("click", function () {
    buttonCallback("moveKeyframeButton");
});

deleteKeyframeButton.addEventListener("click", function () {
    buttonCallback("deleteKeyframeButton");
});

cutButton.addEventListener("click", function () {
    buttonCallback("cutButton");
});

updateButtonImage = function () {
    if (isPlayButton) {
        playPauseButton.style.backgroundImage = 'url("assets/images/pause.png")';
        isPlayButton = false;
    } else {
        playPauseButton.style.backgroundImage = 'url("assets/images/play.png")';
        isPlayButton = true;
    }
}
setPlayToPause = function () {
    playPauseButton.style.backgroundImage = 'url("assets/images/pause.png")';
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
        buttonCallback("readMode : " + readMode);
    }
});
