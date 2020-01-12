// Get a handle to the scripting interface on creation.
// The script interface can trigger events to the client script
let scriptInterface = undefined;
engine.on("facet:updated:core.scripting", function (interface) {
    scriptInterface = interface;
});

engine.trigger("facet:request", ["core.scripting"]);

// Get each of the ability buttons
let button = document.getElementById("openButton");


// Callback to send the button event to the client script
let broadcastEvent = function (event) {
    scriptInterface.triggerEvent(event);
}

// Handle button presses on the ability buttons. Send a specific event for each ability button to the client script.
button.addEventListener("mouseover", function () {
    broadcastEvent("modStarted");
});

button.addEventListener("click", function () {
    broadcastEvent("modStarted");
});