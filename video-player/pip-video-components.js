var createMixin = function(mixinObject, id, assets) {
  var mixin = document.createElement("a-mixin");
  mixin.setAttribute("id", id);
  applyToMixin(mixinObject, mixin);
  if (assets) {
    assets.appendChild(mixin);
  }
  return mixin;
};

var applyToMixin = function(mixinObject, element, asString) {
  if (mixinObject) {
      Object.keys(mixinObject).forEach(function(key){
        if (asString) {

        }
        element.setAttribute(key, mixinObject[key]);
        console.log("Applying mixin: ", element, key, mixinObject[key]);
      }.bind(this));
    }
};

var convertRange = function(oldValue, oldMin, oldMax, newMin, newMax) {
    var oldRange = (oldMax - oldMin); 
    var newRange = (newMax - newMin);
    return (((oldValue - oldMin) * newRange) / oldRange) + newMin;
  };

AFRAME.registerComponent('follow-position', {
  schema: {
    entity: {type: "selector"},
    x: {default: true},
    y: {default: true},
    z: {default: true},
    xOffset: {default: 0},
    yOffset: {default: 0},
    zOffset: {default: 0},
  },
  init: function () {
    //this.el.setAttribute("position", this.data.entity.components.position.data);
  },
  update: function(oldData) {
  },
  play: function () {
  },
  pause: function () {         
  },
  tick: function (time, deltaTime) {
    this.followPosition();
  },
  followPosition: function() {
    var newPosition = {
      x: this.data.x? this.data.entity.components.position.data.x + this.data.xOffset: this.el.components.position.data.x,
      y: this.data.y? this.data.entity.components.position.data.y + this.data.yOffset: this.el.components.position.data.y,
      z: this.data.z? this.data.entity.components.position.data.z + this.data.zOffset:this.el.components.position.data.z,
    };
    this.el.setAttribute("position", newPosition);
  }
});

AFRAME.registerComponent('follow-rotation', {
  schema: {
    entity: {type: "selector"},
    x: {default: false},
    y: {default: true},
    z: {default: false},
    xOffset: {default: 0},
    yOffset: {default: 0},
    zOffset: {default: 0},
  },
  init: function () {
    //this.el.setAttribute("position", this.data.entity.components.position.data);
  },
  update: function(oldData) {
    var rotation = this.el.getAttribute("rotation");
    if (oldData.xOffset) rotation.x += oldData.xOffset != this.data.xOffset? this.data.xOffset - oldData.xOffset: 0;
    else rotation.x += this.data.xOffset;
    if (oldData.yOffset) rotation.y += oldData.yOffset != this.data.yOffset? this.data.yOffset - oldData.yOffset: 0;
    else rotation.y += this.data.yOffset;
    if (oldData.zOffset) rotation.z += oldData.zOffset != this.data.zOffset? this.data.zOffset - oldData.zOffset: 0;
    else rotation.z += this.data.zOffset;
    
    this.el.setAttribute("rotation", rotation);
  },
  play: function () {
  },
  pause: function () {         
  },
  tick: function (time, deltaTime) {
    this.followRotation();
  },
  followRotation: function() {
    var newRotation = {
      x: this.data.x? this.data.entity.components.rotation.data.x + this.data.xOffset: this.el.components.rotation.data.x,
      y: this.data.y? this.data.entity.components.rotation.data.y + this.data.yOffset: this.el.components.rotation.data.y,
      z: this.data.z? this.data.entity.components.rotation.data.z + this.data.zOffset:this.el.components.rotation.data.z,
    };
    this.el.setAttribute("rotation", newRotation);
  }
});

// Takes care of Model and Controller responsibilities (MVC pattern) for Video Interface
AFRAME.registerComponent('pip-video-interface', {
  schema: {
    video360: {type: "selector"},
    video2d: {type: "selector"},
    camera: {type: "selector", default: null},
  },
  init: function () {
    var width = this.data.video2d.getAttribute("width");
    var height = this.data.video2d.getAttribute("height");
    var multiplier = 1;
    width *= multiplier;
    height *= multiplier;
    this.data.video2d.setAttribute("width", width);
    this.data.video2d.setAttribute("height", height);

    // Sets up a new child element with video controls component
    this.videoControls = document.createElement("a-entity");
    this.videoControls.setAttribute("id", "video-ui-controls");
    this.videoControls.setAttribute("visible", "false");
    this.videoControls.setAttribute("position", {z: -1});
    this.videoControls.setAttribute("pip-video-controls", {controller: "#" + this.el.getAttribute("id")});

    // Dimmer
    this.dimmer = document.createElement("a-dimmer");
    this.dimmer.setAttribute("visible", false);

    // Click Anywhere Trigger
    this.toggleControlsTrigger = document.createElement("a-dimmer");
    this.toggleControlsTrigger.setAttribute("id", "toggle-controls-trigger");
    this.toggleControlsTrigger.setAttribute("opacity", 0.0);
    this.toggleControlsTrigger.setAttribute("size", 110.0);

    // Pivot Point for Video Controls
    this.videoControlsPivot = document.createElement("a-entity");
    this.videoControlsPivot.setAttribute("id", "video-controls-pivot");
    if (this.data.camera !== null) {
      this.videoControlsPivot.setAttribute("follow-rotation", {entity: this.data.camera});
      this.videoControlsPivot.setAttribute("follow-position", {entity: this.data.camera});
    }

    this.videoControlsPivot.appendChild(this.videoControls);
    this.videoControlsPivot.appendChild(this.dimmer);
    this.el.appendChild(this.videoControlsPivot);

    this.el.appendChild(this.toggleControlsTrigger);
    

    this.controlsVisible = false;
    this.timeoutActive = false;
    this.controlsTimeoutMax = 10 * 1000;
    this.controlsTimeoutShort = 1 * 1000;
    this.controlsTimeout = this.controlsTimeoutMax;
    

    this.data.video2d.setAttribute("floating-video-controls", {controller: "#" + this.el.getAttribute("id")});

    // Click Anywhere
    this.outsideVideoControls = new OutsideEventListener(this.videoControls, this.data.video2d);
    this.outsideVideoControls.addOutsideEventListener("click", function(e){this.toggleControls();}.bind(this));

    // Setup calculation of video duration
    this.video = this.data.video2d.components.material.material.map.image;
    this.video360 = this.data.video360.components.material.material.map.image;
    this.updateVideoDuration();
    this.video.addEventListener("durationchange", this.updateVideoDuration.bind(this));
    this.video360.addEventListener("durationchange", this.updateVideoDuration.bind(this));
    this.videoControls.addEventListener("loaded", function(){console.log("Reacting to loaded event...");this.updateVideoDuration();}.bind(this));
  },
  registerUI: function(uiComponent) {
    this.uiComponent = uiComponent;
    this.uiComponent.el.addEventListener("change", function(event) {
      if (event.detail.userChangedValue) {
        this.seekTo(event.detail.value);
      }
    }.bind(this));
  },
  play: function () {
    this.floatingVideo = this.data.video2d.components["floating-video-controls"];
  },
  pause: function () {         
  },
  tick: function (time, deltaTime) {
    if (this.timeoutActive) {
      this.controlsTimeout -= deltaTime;
      if (this.controlsTimeout < 0) {
        this.hideControls();
      }
    }
    if (this.videoDuration && this.uiComponent) {
      this.uiComponent.setSlider(this.video360.currentTime / this.videoDuration);
      this.videoControls.components["pip-video-controls"].setElapsedTime(this.video360.currentTime);
    }
  },
  clickListener: function(event) {
    if (event.detail.isUIElement) {
      this.activateShortTimeout();
    }

    if (event.detail.targetName === "maximizeButton") {
      this.toggleVideoSize();
    }
  },
  toggleVideoSize: function() {
    console.log("Toggle Video Size!");
    if (this.floatingVideo.maximized) {
      this.minimizeVideo();
    } else {
      this.maximizeVideo();
    }
    
  },
  maximizeVideo: function() {
    var floatingVideo = this.data.video2d.components["floating-video-controls"];
    console.log("floatingVideo: ", floatingVideo);
    floatingVideo.maximizeVideo();
  },
  minimizeVideo: function() {
    this.floatingVideo.minimizeVideo();
  },
  toggleControls: function() {
    if (this.controlsVisible) {
      this.hideControls();
    } else {
      this.bringUpControls();
    }
    console.log("toggleControls called");
  },
  bringUpControls: function() {
    if (!this.controlsVisible) {
      if(!this.uiComponent) {return;}
      this.uiComponent.bringUpControls();
      this.dimmer.setAttribute("visible", true);
      this.floatingVideo.bringUpControls();
      this.fixVideoControls();
      this.outsideVideoControls.addTarget(this.data.video2d);
      this.controlsVisible = true;
      this.activateTimeout();
    }
  },
  hideControls: function() {
    // this.uiComponent.el.setAttribute("visible", "false");
    this.uiComponent.hideControls();
    this.dimmer.setAttribute("visible", false);
    this.floatingVideo.hideControls();
    this.unfixVideoControls();
    this.outsideVideoControls.removeTarget(this.data.video2d);
    this.controlsVisible = false;
    
    this.pauseTimeout();
  },
  fixVideoControls: function() {
    this.videoControlsPivot.setAttribute("follow-rotation", {x: false, y: false, z: false});
  },
  unfixVideoControls: function() {
    if (this.data.camera !== null) {
      this.videoControlsPivot.setAttribute("follow-rotation", {x: false, y: true, z: false});
    }
  },
  updateVideoDuration: function() {
    this.videoDuration = this.video.duration > this.video360.duration ? this.video360.duration : this.video.duration;
    console.log("updateVideoDuration called");
    console.log("Video Duration: ", this.videoDuration);
    if (typeof this.videoControls.components !== undefined) {
      this.videoControls.components["pip-video-controls"].setVideoDuration(this.videoDuration);
    }
  },
  toggleVideos: function() {
    var video = this.data.video2d.components.material.material.map.image;
    var video360 = this.data.video360.components.material.material.map.image;
    if (video.paused) {
      video.play();
      video360.play();
      this.activateShortTimeout();
    } else {
      video.pause();
      video360.pause();
      this.pauseTimeout();
    }
  },
  /**
   * Scrubs to the specified position in the video
   * @param  {number} position [The position in the video between 0 and 1]
   */
  seekTo: function (position) {
    var time = position * this.videoDuration;
    this.seekToSecond(time);
  },
  /**
   * Scrubs to the specified time in seconds in the video
   * @param  {Number} time [Time in seconds]
   */
  seekToSecond: function(time) {
    this.video.currentTime = time;
    this.video360.currentTime = time;
  },
  activateTimeout: function() {
    this.controlsTimeout = this.controlsTimeoutMax;
    this.timeoutActive = true;
  },
  activateShortTimeout: function() {
    this.controlsTimeout = this.controlsTimeoutShort;
    this.timeoutActive = true;
  },
  pauseTimeout: function() {
    this.timeoutActive = false;
  }
});

AFRAME.registerComponent('floating-video-controls', {
  schema: {
    controller: {type: "selector"},
    fixPositionDuringFreeTransform: {default: true},
  },
  videoPositions: {
    top: {xOffset:30, yOffset: 0, zOffset: 0},
    bottom: {xOffset:-30, yOffset: 0, zOffset: 0},
    topLeft: {xOffset:10, yOffset: 20, zOffset: 0},
    topRight:{xOffset:30, yOffset: -20, zOffset: 0},
    right: {xOffset:0, yOffset: -20, zOffset: 0},
  },
  dependencies: ["position"],
  init: function () {
    this.maximized = false;
    this.forceFixPosition = false;
    this.freeTransformActive = false;
    var position = this.el.getAttribute("position");
    this.maximizeDepth = position.z / 1.5;
    this.minimizeDepth = position.z;

    this.videoHeight = this.el.components.geometry.data.height;
    this.videoWidth = this.el.components.geometry.data.width;
    this.buttonHeight = this.videoHeight / 4;
    this.border = 0.5 + this.buttonHeight/2;
    this.smallBorder = this.border/this.videoHeight;
    console.log(this.buttonHeight);

    this.uiEntity = document.createElement("a-entity");
    this.el.appendChild(this.uiEntity);
    this.hideControls();

    // Maximize Minimize Button
    this.maximizeButton = document.createElement("a-entity");
    this.maximizeButton.setAttribute("material", {color: "white", src: "#maximize-icon", transparent: false});
    this.maximizeButton.setAttribute("geometry", {primitive: "circle", radius: 0.5*this.buttonHeight});
    maximizePosXY = convertRange(0, -1, 1, -this.videoWidth / 2 + this.border, this.videoWidth / 2 - this.border);
    this.maximizeButton.setAttribute("position", {x: maximizePosXY, y: maximizePosXY, z:0.1});
    this.maximizeButton.setAttribute("button", {clickedStateObject: {material: {src: "#minimize-icon"}}});
    this.uiEntity.appendChild(this.maximizeButton);
    this.maximizeButton.addEventListener("click", this.maximizeBtnPressed.bind(this));

    // Pin Unpin Button
    this.fixPositionButton = document.createElement("a-entity");
    this.fixPositionButton.setAttribute("material", {color: "white", src: "#pin-icon", transparent: false});
    this.fixPositionButton.setAttribute("geometry", {primitive: "circle", radius: 0.5*this.buttonHeight});
    this.setRelativePosition(this.fixPositionButton, -1, -1);
    this.fixPositionButton.setAttribute("button", {clickedStateObject: {material: {src: "#unpin-icon"}}});
    this.uiEntity.appendChild(this.fixPositionButton);
    this.fixPositionButton.addEventListener("click", this.fixPositionBtnPressed.bind(this));

    // Free Transform/ Drag n' Drop Button
    this.freeTransformButton = document.createElement("a-entity");
    this.freeTransformButton.setAttribute("material", {color: "white", src: "#free-transform-icon", transparent: false});
    this.freeTransformButton.setAttribute("geometry", {primitive: "circle", radius: 0.5*this.buttonHeight});
    this.setRelativePosition(this.freeTransformButton, -0.5, -1);
    this.freeTransformButton.setAttribute("button", {clickedStateObject: {material: {src: "#free-transform-active-icon"}}});
    this.uiEntity.appendChild(this.freeTransformButton);
    this.freeTransformButton.addEventListener("click", this.freeTransformBtnPressed.bind(this));


    //this.maximizeButton = this.setupButton(0, 0, this.maximizeBtnPressed.bind(this));

    // Standard position buttons 
    // this.moveRightButton = this.setupButton(1, 0, this.moveRightBtnPressed.bind(this), null, {material: {color: "white"}});
    // this.moveUpButton = this.setupButton(0, 1, this.moveUpBtnPressed.bind(this), null, {material: {color: "white"}});
    // this.moveDownButton = this.setupButton(0, -1, this.moveDownBtnPressed.bind(this), null, {material: {color: "white"}});


    //this.fixPositionButton = this.setupButton(-1, -1, this.fixPositionBtnPressed.bind(this));
    //this.freeTransformButton = this.setupButton(-0.5, -1, this.freeTransformBtnPressed.bind(this));

  },
  setRelativePosition: function(button, posX, posY) {
    button.setAttribute("position", {
      x: convertRange(posX, -1, 1, -this.videoWidth / 2 + this.border, this.videoWidth / 2 - this.border), 
      y: convertRange(posY, -1, 1, -this.videoHeight / 2 + this.border, this.videoHeight / 2 - this.border), 
      z:0.1
    });
  },
  setupButton: function(posX, posY, callback, initState, clickedState) {
    var button = this.createButton(posX, posY, initState, clickedState);
    this.uiEntity.appendChild(button);
    button.addEventListener("click", callback);
    return button;
  },

  /**
   * Creates a button with the specified textures or default colors if not provided
   * @param  {[type]} xPos       [Position between -1 (left) and 1 (right)]
   * @param  {[type]} yPos       [Position between -1 and 1]
   * @param  {[type]} initState        [Initial State for button as mixin object]
   * @param  {[type]} clickedState [mixin object for button when in clicked state]
   * @return {[type]}            [HTML element configured with button properties]
   */
  createButton: function(xPos, yPos, initState, clickedState) {
    var button = document.createElement("a-entity");
    if (initState) {
      applyToMixin(initState, button);
      if (initState.geometry) {
        if (!initState.geometry.width || !initState.geometry.height) {
          button.setAttribute("geometry", {width: this.buttonHeight, height: this.buttonHeight});
        }
      } else {
        button.setAttribute("geometry", {width: this.buttonHeight, height: this.buttonHeight});
      } 
    } 
    else 
    {
      button.setAttribute("geometry", {primitive: "plane", width: this.buttonHeight, height: this.buttonHeight});
      button.setAttribute("material", {color: "white"});
    }
    
    
    var btnXPos = convertRange(xPos, -1, 1, -this.videoWidth / 2 + this.border, this.videoWidth / 2 - this.border);
    var btnYPos = convertRange(yPos, -1, 1, -this.videoHeight / 2 + this.border, this.videoHeight / 2 - this.border);
    button.setAttribute("position", {x: btnXPos, y: btnYPos, z:0.1});

    if (clickedState) {
      button.setAttribute("button", clickedState);
    } else {
      button.setAttribute("button", {clickedStateObject: {
        material: {
          color: "red"
        }
      }});
    }

    return button;
  },
  update: function(oldData) {

  },
  play: function () {
    this.data.controller.components["pip-video-interface"].registerUI(this);
  },
  pause: function () {         
  },
  tick: function (time, deltaTime) {
  },
  moveRightBtnPressed: function () {
    var eventInfo = {
      isUIElement: true,
      target: this.moveRightButton,
      targetName: "moveRightButton"
    };
    this.el.emit("click", eventInfo);
    this.moveVideo(this.videoPositions.right);
  },
  moveUpBtnPressed: function() {
    var eventInfo = {
      isUIElement: true,
      target: this.moveUpButton,
      targetName: "moveUpButton"
    };
    this.el.emit("click", eventInfo);
    this.moveVideo(this.videoPositions.top);
  },
  moveDownBtnPressed: function() {
    var eventInfo = {
      isUIElement: true,
      target: this.moveDownButton,
      targetName: "moveDownButton"
    };
    this.el.emit("click", eventInfo);
    this.moveVideo(this.videoPositions.bottom);
  },
  maximizeBtnPressed: function () {
    console.log("maximizeButton pressed!");
    var eventInfo = {
      isUIElement: true,
      target: this.maximizeButton,
      targetName: "maximizeButton"
    };
    this.el.emit("click", eventInfo);

    if (this.maximized) {
      this.minimizeVideo();
    } else {
      this.maximizeVideo();
    }
  },
  fixPositionBtnPressed: function() {
    var eventInfo = {
      isUIElement: true,
      target: this.fixPositionButton,
      targetName: "fixPositionButton"
    };
    this.el.emit("click", eventInfo);
    this.forceFixPosition = !this.forceFixPosition;
  },
  freeTransformBtnPressed: function() {
    var eventInfo = {
      isUIElement: true,
      target: this.freeTransformButton,
      targetName: "freeTransformButton"
    };
    this.el.emit("click", eventInfo);
    this.freeTransformActive = !this.freeTransformActive;
    if (this.data.fixPositionDuringFreeTransform && this.freeTransformActive
        && this.fixPositionButton.components.button.buttonState != this.fixPositionButton.components.button.buttonStates.CLICKED) {
      this.fixPositionButton.emit("click");
    }
    
  },
  fixPosition: function() {
    this.el.parentElement.setAttribute("follow-rotation", {x: false, y: false, z: false});
  },
  unfixPosition: function() {
    if (!this.forceFixPosition) {
      this.el.parentElement.setAttribute("follow-rotation", {x: false, y: true, z: false});
    }
    if (this.freeTransformActive) {
      this.el.parentElement.setAttribute("follow-rotation", {x: true, y: true, z: false, xOffset: 0, yOffset: 0, zOffset: 0});
    }
  },
  maximizeVideo: function(position) {
    if (position) this.moveVideo(position);
    this.el.setAttribute("position", {z: this.maximizeDepth});
    this.maximized = true;
  },
  minimizeVideo: function () {
    this.el.setAttribute("position", {z: this.minimizeDepth});
    this.maximized = false;
  },
  moveVideo: function(position) {
    this.el.parentElement.setAttribute("follow-rotation", position);
  },
  bringUpControls: function() {
    this.uiEntity.setAttribute("visible", "true");
    this.controlsVisible = true;
    this.fixPosition();
    this.uiEntity.play();
  },
  hideControls: function() {
    this.uiEntity.setAttribute("visible", "false");
    this.controlsVisible = false;
    this.unfixPosition();
    this.uiEntity.pause();
  },
});

AFRAME.registerPrimitive('a-dimmer', {
  defaultComponents: {
    geometry: {
      primitive: "sphere",
      radius: 100,
    },
    material: {
      shader: "flat",
      side: "back",
      transparent: true,
      color: "black",
      opacity: 0.2,
    }
  },
  mappings: {
    opacity: 'material.opacity',
    radius: 'geometry.radius'
  },
});

// Takes care of View responsibilities (MVC pattern) for Video Interface
AFRAME.registerComponent('pip-video-controls', {
  schema: {
    controller: {type: "selector"},
    dimmerOpacity: {default: 0.2},
  },
  init: function () {
    if(!this.el.getAttribute("visible")) {
      this.el.setAttribute("visible", "false");
    }
    this.uiElements = [];

    var assets = document.createElement("a-assets");
    var tomatoColorMixin = document.createElement("a-mixin");
    tomatoColorMixin.setAttribute("id", "tomatoColor");
    tomatoColorMixin.setAttribute("material", "color: tomato");
    assets.appendChild(tomatoColorMixin);
    this.el.sceneEl.appendChild(assets);
    
    // Play Pause Button
    this.playPauseButton = document.createElement("a-entity");
    this.playPauseButton.setAttribute("material", {color: "green", src: "#pause-icon", transparent: false});
    //this.playPauseButton.setAttribute("geometry", {primitive: "plane", width: 1, height: 1,});
    this.playPauseButton.setAttribute("geometry", {primitive: "circle", radius: 0.5});
    this.playPauseButton.setAttribute("position", {x: 0, y: 0.25, z:-2});
    //this.playPauseButton.setAttribute("button", {clickedState: "#tomatoColor"});
    this.playPauseButton.setAttribute("button", {clickedStateObject: {material: {src: "#play-icon"}}});

    // Slider

    var buttonOriginalState = document.createElement("a-mixin");
    buttonOriginalState.setAttribute("id", "sliderButtonOriginal");
    buttonOriginalState.setAttribute("material", "color: white");
    assets.appendChild(buttonOriginalState);
    this.el.sceneEl.appendChild(assets);

    this.slider = document.createElement("a-entity");
    this.slider.setAttribute("position", {x: 0, y: -0.5, z:-2});
    this.slider.setAttribute("material", {color: "black"});
    this.slider.setAttribute("geometry", {primitive: "plane", width: 2, height: 0.2,});
    this.slider.setAttribute("slider", {
      buttonOriginalState: "#sliderButtonOriginal",
      //buttonClickedState: "#tomatoColor",
    });

    // Text Elements for video duration

    this.displayDuration = "-";
    this.displayElapsedTime = "-";

    this.videoDuration = document.createElement("a-text");
    this.videoDuration.setAttribute("value", "0:00 / -");
    this.videoDuration.setAttribute("font", "roboto");
    this.videoDuration.setAttribute("position", {x: -1, y: -0.7, z: -2});
    this.videoDuration.setAttribute("width", 3);


    this.el.appendChild(this.videoDuration);
    this.el.appendChild(this.playPauseButton);
    this.el.appendChild(this.slider);
    //this.el.appendChild(this.dimmer);

    this.uiElements.push(this.videoDuration);
    this.uiElements.push(this.playPauseButton);
    this.uiElements.push(this.slider);
    this.playPauseButton.addEventListener("click", this.playPause.bind(this));

    // Emit Has-loaded Event
    var eventInfo = {
      isUIElement: true,
      target: this,
      targetName: "pip-video-controls"
    };
    this.el.emit("loaded", eventInfo);
  },
  play: function () {
    this.data.controller.components["pip-video-interface"].registerUI(this);
    this.slider.addEventListener("change", function (event) {
      var controller = this.data.controller.components["pip-video-interface"];
      if (event.detail.userChangedValue) {
        controller.seekTo(event.detail.value);
      }
      

    }.bind(this));
  },
  setVideoDuration: function(durationInSeconds) {
    if (!durationInSeconds || isNaN(durationInSeconds))
      return;

    // var decimalMinutes = durationInSeconds / 60.0;
    // var minutes = Math.floor(decimalMinutes);
    // var seconds = (decimalMinutes - minutes) * 60;
    // seconds = Math.floor(seconds);
    // this.duration = minutes < 10? "0" + minutes: "" + minutes;
    // this.duration += seconds < 10? ":0" + seconds: ":" + seconds;
    var duration = convertToDisplayTime(durationInSeconds);
    this.updateDurationLabel(duration);
  },
  updateDurationLabel: function(displayDuration) {
    if (this.displayDuration !== displayDuration) {
      this.displayDuration = displayDuration;
      this.updateElapsedDurationLabel();
    }
  },
  setElapsedTime: function(timeInSeconds) {
    if (!timeInSeconds || isNaN(timeInSeconds))
      return;
    // var decimalMinutes = durationInSeconds / 60.0;
    // var minutes = Math.floor(decimalMinutes);
    // var seconds = (decimalMinutes - minutes) * 60;
    // seconds = Math.floor(seconds);
    // this.duration = minutes < 10? "0" + minutes: "" + minutes;
    // this.duration += seconds < 10? ":0" + seconds: ":" + seconds;
    var elapsed = convertToDisplayTime(timeInSeconds);
    this.updateElapsedTimeLabel(elapsed);
  },
  updateElapsedTimeLabel: function(displayElapsedTime) {
    if (this.displayElapsedTime !== displayElapsedTime) {
      this.displayElapsedTime = displayElapsedTime;
      this.updateElapsedDurationLabel();
    }
  },
  updateElapsedDurationLabel: function() {
    this.videoDuration.setAttribute("value", this.displayElapsedTime + " / " + this.displayDuration);
  },
  pause: function () {         
  },
  tick: function (time, deltaTime) {
  },
  bringUpControls: function() {
    this.el.setAttribute("visible", "true");
    this.controlsVisible = true;
    this.enableUI();
  },
  hideControls: function() {
    this.el.setAttribute("visible", "false");
    this.controlsVisible = false;
    this.disableUI();
  },
  playPause: function() {
    var interfaceComponent = this.data.controller.components["pip-video-interface"];
    interfaceComponent.toggleVideos();
  },
  setSlider: function(value) {
    this.slider.components.slider.setValue(value);
  },
  disableUI: function() {
    this.uiElements.forEach(function(element) {
      element.pause();
    });
  },
  enableUI: function() {
    this.uiElements.forEach(function(element) {
      element.play();
    });
  },
});

// ------- SYNCHRONIZED VIDEO PLAYBACK -------

AFRAME.registerSystem('synchronized-video', {
  init: function () {
    this.entities = new Map();
  },
  registerMe: function (el) {
    this.entities.set(el, "");
  },
  unregisterMe: function (el) {
    this.entities.delete(el);
  },
  changeStateState: function(el, state) {
    this.entities.set(el, state);
  }
});
AFRAME.registerComponent('synchronized-video', {
  init: function () {
    this.system.registerMe(this.el);
    var video = this.el.components.material.material.map.image;
    if (!video) { return; }
    //video.addEventListener("canplay", function() {console.log("Video can play!"); })
  },
  remove: function () {
    this.system.unregisterMe(this.el);
  },
  playVideo: function() {
    var video = this.el.components.material.material.map.image;
    if (!video) { return; }
    video.play();
  }
});

AFRAME.registerComponent('button', {
  schema: {
    width: {default: "1"},
    heigth: {default: "1"},
    clickedColor: {default: "green"},
    clickedState: {type: "selector"}, // Mixin defining clicked State
    pressedState: {type: "selector"},
    hoverState: {type: "selector"},

    clickedStateObject: {type: "string"}, // Mixin defining clicked State
    pressedStateObject: {type: "string"},
    hoverStateObject: {type: "string"},
  },
  dependencies: ["geometry", "material"],
  buttonStates: {
    PRESSED: "pressed", // Whenever button is being held down, upon release the button is not pressed anymore
    CLICKED: "clicked", // Buttons assumes this state after it gets clicked for the first time and every other time afterwards
    ORIGINAL: "original", // Default state for a button, when it has not been clicked. When a clicked button gets clicked again, the state reverts back to original
    HOVER: "hover",
  },
  init: function () {
    this.el.classList.add("clickable");

    if (this.data.clickedStateObject) {
      console.log("Clicked State Object: ", this.data.clickedStateObject);
    }

    this.el.addEventListener("click", this.onClick.bind(this));

    this.buttonState = this.buttonStates.ORIGINAL;
    // Fake Mixin to save original appearance
    this.originalAppearance = {
      material: this.el.getAttribute("material"),
      geometry: this.el.getAttribute("geometry"),
    };
    this.pressedAppearance = this.data.pressedState? this.data.pressedState.componentCache: this.data.pressedStateObject;
    this.clickedAppearance = this.data.clickedState? this.data.clickedState.componentCache: this.data.clickedStateObject;
    this.hoverAppearance = this.data.hoverState? this.data.hoverState.componentCache: this.data.hoverStateObject;
  },
  update: function(oldData) {
  },
  play: function () {
    console.log("Play called!");
    //this.el.addEventListener("click", this.onClick.bind(this));
  },
  pause: function () {   
    console.log("Pause called!"); 
    //this.el.removeEventListener("click", this.onClick.bind(this));     
  },
  tick: function (time, deltaTime) {
  },
  onClick: function(event) {
    console.log("Click Event fired by Button", event.detail);
    if (this.buttonState == this.buttonStates.ORIGINAL) {
      this.changeButtonState(this.buttonStates.CLICKED);
    }
    else {
      this.changeButtonState(this.buttonStates.ORIGINAL);
    }

  },
  changeButtonState: function(newState) {
    this.buttonState = newState;
    if (newState == this.buttonStates.ORIGINAL) {
      this.applyMixin(this.originalAppearance);
    } 
    else if (newState == this.buttonStates.PRESSED) {
      this.applyMixin(this.pressedAppearance);
    }
    else if (newState == this.buttonStates.CLICKED) {
      this.applyMixin(this.clickedAppearance);
    }
    else if (newState == this.buttonStates.HOVER) {
      this.applyMixin(this.hoverAppearance);
    }
  },
  applyMixin: function(mixin) {
    if (mixin) {
      Object.keys(mixin).forEach(function(key){
        this.el.setAttribute(key, mixin[key]);
      }.bind(this));
    }
  },
});


AFRAME.registerComponent('slider', {
  schema: {
    width: {default: 2},
    height: {default: 0.2},
    buttonOriginalState: {type: "selector"},
    buttonClickedState: {type: "selector"}, // Mixin defining clicked State
    buttonPressedState: {type: "selector"},
    buttonHoverState: {type: "selector"},

    buttonOriginalStateObject: {type: "string"},
    buttonClickedStateObject: {type: "string"}, // Object defining clicked State
    buttonPressedStateObject: {type: "string"},
    buttonHoverStateObject: {type: "string"},

    minValue: {default: 0},
    maxValue: {default: 1},
    value: {default: 0.25},
  },
  dependencies: ["geometry", "material"],
  init: function () {
    this.el.classList.add("clickable");
    var buttonSize = 0.75;
    this.sliderButton = document.createElement("a-entity");
    this.el.appendChild(this.sliderButton);
    
    this.sliderButton.setAttribute("material", {color: "white"});
    this.sliderButton.setAttribute("geometry", {
      primitive: "circle", 
      radius: (this.data.height*buttonSize / 2),
    });

    this.sliderButtonY = 0;
    this.sliderButtonZ = 0.01;
    this.moveSlider(this.data.value);


    this.sliderButton.setAttribute("button", {
      clickedState: this.data.buttonClickedState,
      pressedState: this.data.buttonPressedState,
      hoverState: this.data.buttonHoverState,

      clickedStateObject: this.data.buttonClickedStateObject,
      pressedStateObject: this.data.buttonPressedStateObject,
      hoverStateObject: this.data.buttonHoverStateObject,

    });
    
    //this.moveSlider(0.25);
    this.el.addEventListener("click", this.onClick.bind(this));
  },
  update: function(oldData) {
    
  },
  play: function () {
    //this.el.addEventListener("click", this.onClick.bind(this));
    // this.moveSlider(this.data.value);
  },
  pause: function () {    
    //this.el.removeEventListener("click", this.onClick.bind(this));     
  },
  tick: function (time, deltaTime) {
  },
  setValue: function(value) {
    this.moveSlider(value, false);
  },
  onClick: function(event) {
    var localPos = new THREE.Vector3(
      event.detail.intersection.point.x,
      event.detail.intersection.point.y,
      event.detail.intersection.point.z);

    this.el.object3D.worldToLocal(localPos);
    this.moveSliderTo(localPos.x, true);
  },
  moveSlider: function(value, userChangedValue) {
    if (value != this.value) {
      var eventInfo = {
        value: value, 
        oldValue: this.value,
        userChangedValue: userChangedValue == true ? true : false,
      };
      this.el.emit("change", eventInfo);

      this.value = value;

      var normalizedValue = value - this.data.minValue / (this.data.maxValue - this.data.minValue);
      var position = this.convertRange(value, this.data.minValue, this.data.maxValue, -this.data.width/2, this.data.width/2);
      this.sliderButton.setAttribute("position", {x:position, y: this.sliderButtonY, z: this.sliderButtonZ});
    }
    
  },
  moveSliderTo: function(positionX, userChangedValue) {
    var value = this.convertRange(positionX, -this.data.width/2, this.data.width/2, this.data.minValue, this.data.maxValue);
    this.moveSlider(value, userChangedValue);
  },
  normalize: function(value, minValue, maxValue) {
    return value - minValue / (maxValue - minValue);
  },
  convertRange: function(oldValue, oldMin, oldMax, newMin, newMax) {
    var oldRange = (oldMax - oldMin); 
    var newRange = (newMax - newMin);
    return (((oldValue - oldMin) * newRange) / oldRange) + newMin;
  },
  applyMixinTo: function(mixin, element) {
    if (mixin) {
      Object.keys(mixin.componentCache).forEach(function(key){
        element.setAttribute(key, mixin.componentCache[key]);
      });
    }
  },
});