// Get a handle to the scripting interface on creation.
// The script interface can trigger events to the client script
let scriptInterface = null;
engine.on("facet:updated:core.scripting", function (interface) {
    scriptInterface = interface;
});

engine.trigger("facet:request", ["core.scripting"]);