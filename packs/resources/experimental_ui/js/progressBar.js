// Get a handle to the scripting interface on creation.
// The script interface can trigger events to the client script
let scriptInterface = null;
engine.on("facet:updated:core.scripting", function (interface) {
    scriptInterface = interface;
    scriptInterface.triggerEvent("progressBarOpened");
});

engine.trigger("facet:request", ["core.scripting"]);

engine.on("mcbestudio:update_modal_value", function (newSize) {
    document.getElementById("modal-content").style.backgroundImage = 'url("assets/images/modal_' + newSize + '.png")';
});