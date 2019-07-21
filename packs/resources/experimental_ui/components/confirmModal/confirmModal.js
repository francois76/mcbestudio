// Get a handle to the scripting interface on creation.
// The script interface can trigger events to the client script
let scriptInterface = null;
engine.on("facet:updated:core.scripting", function (interface) {
    scriptInterface = interface;
});

engine.trigger("facet:request", ["core.scripting"]);

// Callback to send the button event to the client script
let broadcastEvent = function (event) {
    scriptInterface.triggerEvent(event);
}

let noButton = document.getElementById("noButton");
let yesButton = document.getElementById("yesButton");

// Handle button presses on the ability buttons. Send a specific event for each ability button to the client script.
noButton.addEventListener("click", function () {
    broadcastEvent("noButton");
});
yesButton.addEventListener("click", function () {
    broadcastEvent("yesButton");
});