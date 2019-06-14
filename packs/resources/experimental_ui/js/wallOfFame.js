
// Get a handle to the scripting interface on creation.
// The script interface can trigger events to the client script
let scriptInterface = null;
engine.on("facet:updated:core.scripting", function (interface) {
    scriptInterface = interface;
    scriptInterface.triggerEvent("indexUiOpened");
});

engine.trigger("facet:request", ["core.scripting"]);

// Callback to send the button event to the client script
let buttonCallback = function (event) {
    scriptInterface.triggerEvent(event);
}

let backButton = document.getElementById("backButton");

backButton.addEventListener("click", function () {
    buttonCallback("backButtonWallOfFame");
});