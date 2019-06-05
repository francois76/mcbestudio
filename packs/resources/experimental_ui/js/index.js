
// Get a handle to the scripting interface on creation.
// The script interface can trigger events to the client script
let scriptInterface = null;
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
    if(suppressWarningTriggered){
        updateKeyFrameNumber(0);
        document.getElementById("timeline").textContent = generateUpdatedTimeline();
        buttonCallback("deleteSequence");
        deleteSequenceButton.style.backgroundColor = "blue";
        deleteSequenceButton.textContent = "Sequence deleted"
        suppressWarningTriggered = false;
    }else{
        deleteSequenceButton.style.backgroundColor = "red";
        deleteSequenceButton.textContent = "Click again to confirm"
        suppressWarningTriggered = true;
    }
    
});

deleteSequenceButton.addEventListener("mouseout", function () {
    deleteSequenceButton.style.backgroundColor = "#31B23D";
    deleteSequenceButton.textContent = "Delete sequence"
});
    
playPauseButton.addEventListener("click", function () {
    updateButtonImage();
    if(isPlayButton){
        buttonCallback("pause");
    }else{
        buttonCallback("play");
    }
});

playFullButton.addEventListener("click", function () {
	buttonCallback("playFull");
});
    
firstFrameButton.addEventListener("click", function () {
    currentKeyFrame = 1;
    document.getElementById("timeline").textContent = generateUpdatedTimeline();
	buttonCallback("firstFrame");
});
    
previousFrameButton.addEventListener("click", function () {
    if(currentKeyFrame>1){
        currentKeyFrame--;
        document.getElementById("timeline").textContent = generateUpdatedTimeline();
        buttonCallback("previousFrame");
    }
});
    
nextFrameButton.addEventListener("click", function () {
    if(currentKeyFrame<keyFrameNumber){
        currentKeyFrame++;
        document.getElementById("timeline").textContent = generateUpdatedTimeline();
        buttonCallback("nextFrame");
    }
});
    
lastFrameButton.addEventListener("click", function () {
    currentKeyFrame = keyFrameNumber;
    document.getElementById("timeline").textContent = generateUpdatedTimeline();
	buttonCallback("lastFrame");
});

updateButtonImage = function(){
    if(isPlayButton){
        playPauseButton.style.backgroundImage = 'url("assets/images/pause.png")';
        isPlayButton = false;
    }else{
        playPauseButton.style.backgroundImage = 'url("assets/images/play.png")';
        isPlayButton = true;
    }
}

generateUpdatedTimeline = function(){
    generatedTimeLine = "";
    if(keyFrameNumber === 0){
        timelineIndex = -1;
    }else{
        timelineIndex = Math.floor((currentKeyFrame-1) * ((rawTimeLineLength/(keyFrameNumber-1))));
    }
    for(i = 0;i<=rawTimeLineLength;i++){
        if(i === timelineIndex){
            generatedTimeLine = generatedTimeLine + "O";
        }else{
            generatedTimeLine = generatedTimeLine + "-";
        }
    }
    return "[" + generatedTimeLine + "]";
}

updateKeyFrameNumber = function(keyFrameNumberServer){
    keyFrameNumber = keyFrameNumberServer;
}

engine.on("mcbestudio:updateFrameNumberUi", function(frameNumberEventdata){
    updateKeyFrameNumber(frameNumberEventdata);
    document.getElementById("timeline").textContent = generateUpdatedTimeline();
});

engine.on("mcbestudio:switchPlayToPause", function(eventdata){
    updateButtonImage();
});

engine.on("mcbestudio:notifyCurrentFrame", function(currentFrame){
    currentKeyFrame = (currentFrame/240) + 1;
    document.getElementById("timeline").textContent = generateUpdatedTimeline();
});

engine.on("mcbestudio:updateModal", function(newSize){
});
