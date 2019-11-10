# MCBE Studio
MCBE Studio is an addon for Minecraft Bedrock 1.13 that make timelapses possible on the bedrock edition of the game. As the scripting API is still quite simple, this addon couldn't be compared with what replaymod can do on java, but this addon make possible to place keyframes in the world that are interpolated to generate a sequence.


## How to use :
![init image](/assets/init.jpg)
On the GUI, there is a button called "Open MCBE Studio". Due to the lack of event handler in the API for now, the only way to open the main interface is to open any game interface (pause, inventory, chat...), put the mouse cursor where the button is, and exit the interface with keyboard

![interface image](/assets/interface.jpg)
The main interface contains several buttons :

 - "Generate sequence" make the sequence playable when all keyframes are placed
 - "Place Keyframe" is a button to enter in keyframe placement mode
 
Below the timeline, there are some buttons to go to the previous and the next frame, to the first and the last one, a play/pause button, and an unused button that will make possible to play the sequence without interface.

![enter image description here](/assets/place-keyframe.jpg)
On keyframe mode, punch the armor stand in front of you to place a keyframe, and to exit keyframe mode, stop moving, and turn to punch the other one.
