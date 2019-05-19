// Get a handle to the scripting interface on creation.
// The script interface can trigger events to the client script
let scriptInterface = null;
engine.on("facet:updated:core.scripting", function (interface) {
    scriptInterface = interface;
    scriptInterface.triggerEvent("progressBarRecognised");
});

engine.trigger("facet:request", ["core.scripting"]);

engine.on("mcbestudio:updateModal", function(newSize){
    //currentSize = document.getElementById("inner-bar").style.width.split("%")[0];
    scriptInterface.triggerEvent(currentSize);
    /*while(currentSize<newSize){
        document.getElementById("inner-bar").style.width = currentSize + "%";
        scriptInterface.triggerEvent(currentSize);
        currentSize++;
    }*/
});