AFRAME.registerComponent('follow-rotation', {
  schema: {
    entity: {type: "selector"},
    x: {default: false},
    y: {default: true},
    z: {default: false},
  },
  init: function () {
    //this.el.setAttribute("position", this.data.entity.components.position.data);
    this.followRotation();
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
      x: this.data.x? this.data.entity.components.rotation.data.x: this.el.components.rotation.data.x,
      y: this.data.y? this.data.entity.components.rotation.data.y: this.el.components.rotation.data.y,
      z: this.data.z? this.data.entity.components.rotation.data.z:this.el.components.rotation.data.z,
    };
    this.el.setAttribute("rotation", newRotation);
  }
});

// Takes care of Model and Controller responsibilities (MVC pattern) for Video Interface
AFRAME.registerComponent('pip-video-interface', {
  schema: {
    video360: {type: "selector"},
    video2d: {type: "selector"},
  },
  init: function () {
    var width = this.data.video2d.getAttribute("width");
    var height = this.data.video2d.getAttribute("height");
    var multiplier = 1;
    width *= multiplier;
    height *= multiplier;
    this.data.video2d.setAttribute("width", width);
    this.data.video2d.setAttribute("height", height);

    this.controlsVisible = false;
    this.timeoutActive = false;
    this.controlsTimeoutMax = 10 * 1000;
    this.controlsTimeoutShort = 1 * 1000;
    this.controlsTimeout = this.controlsTimeoutMax;
    window.addEventListener("click", this.bringUpControls.bind(this));
  },
  registerUI: function(uiComponent) {
    this.uiComponent = uiComponent;
  },
  play: function () {
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
  },
  bringUpControls: function() {
    if (!this.controlsVisible) {
      if(!this.uiComponent) {return;}
      this.uiComponent.bringUpControls();
      // this.uiComponent.el.setAttribute("visible", "true");
      this.controlsVisible = true;
      this.activateTimeout();
    }
  },
  hideControls: function() {
    // this.uiComponent.el.setAttribute("visible", "false");
    this.uiComponent.hideControls();
    this.controlsVisible = false;
    this.pauseTimeout();
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

// Takes care of View responsibilities (MVC pattern) for Video Interface
AFRAME.registerComponent('pip-video-controls', {
  schema: {
    controller: {type: "selector"},
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
    this.playPauseButton.setAttribute("material", {color: "green"});
    this.playPauseButton.setAttribute("geometry", {primitive: "plane", width: 1, height: 1,});
    this.playPauseButton.setAttribute("position", {x: 0, y: 0.5, z:-2});
    this.playPauseButton.setAttribute("button", {clickedState: "#tomatoColor"});

    // Slider

    var buttonOriginalState = document.createElement("a-mixin");
    buttonOriginalState.setAttribute("id", "sliderButtonOriginal");
    buttonOriginalState.setAttribute("material", "color: white");
    assets.appendChild(buttonOriginalState);
    this.el.sceneEl.appendChild(assets);

    this.slider = document.createElement("a-entity");
    this.slider.setAttribute("position", {x: 0, y: -0.5, z:-2});
    this.slider.setAttribute("material", {color: "blue"});
    this.slider.setAttribute("geometry", {primitive: "plane", width: 2, height: 0.2,});
    this.slider.setAttribute("slider", {
      buttonOriginalState: "#sliderButtonOriginal",
      buttonClickedState: "#tomatoColor",
    });
    

    this.el.appendChild(this.playPauseButton);
    this.el.appendChild(this.slider);

    this.uiElements.push(this.playPauseButton);
    this.uiElements.push(this.slider);
    this.playPauseButton.addEventListener("click", this.playPause.bind(this));
  },
  play: function () {
    this.data.controller.components["pip-video-interface"].registerUI(this);
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
  },
  dependencies: ["geometry", "material"],
  buttonStates: {
    PRESSED: "pressed", // Whenever button is being held down, upon release the button is not pressed anymore
    CLICKED: "clicked", // Buttons assumes this state after it gets clicked for the first time and every other time afterwards
    ORIGINAL: "original", // Default state for a button, when it has not been clicked. When a clicked button gets clicked again, the state reverts back to original
    HOVER: "hover",
  },
  init: function () {
    this.el.addEventListener("click", this.onClick.bind(this));

    this.buttonState = this.buttonStates.ORIGINAL;
    // Fake Mixin to save original appearance
    this.originalAppearance = {};
    this.originalAppearance.componentCache = {
      material: this.el.getAttribute("material"),
      geometry: this.el.getAttribute("geometry"),
    };
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
    console.log("Click Event fired by Button");
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
      this.applyMixin(this.data.pressedState);
    }
    else if (newState == this.buttonStates.CLICKED) {
      this.applyMixin(this.data.clickedState);
    }
    else if (newState == this.buttonStates.HOVER) {
      this.applyMixin(this.data.hoverState);
    }
  },
  applyMixin: function(mixin) {
    if (mixin) {
      Object.keys(mixin.componentCache).forEach(function(key){
        this.el.setAttribute(key, mixin.componentCache[key]);
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
    minValue: {default: 0},
    maxValue: {default: 1},
    value: {default: 0.5},
  },
  dependencies: ["geometry", "material"],
  init: function () {
    var buttonSize = 0.75;
    this.sliderButton = document.createElement("a-entity");
    this.el.appendChild(this.sliderButton);
    //this.applyMixinTo(this.data.buttonOriginalState, this.sliderButton);
    this.sliderButton.setAttribute("material", {color: "tomato"});
    this.sliderButton.setAttribute("geometry", {
      primitive: "plane", 
      width: this.data.height*buttonSize,
      height: this.data.height*buttonSize,
    });
    this.sliderButton.setAttribute("position", {x: 0, y: 0, z: 0.1});
    this.sliderButton.setAttribute("button", {
      clickedState: this.data.buttonClickedState,
      pressedState: this.data.buttonPressedState,
      hoverState: this.data.buttonHoverState,
    });
    
    this.moveSlider(0.25);
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

  },
  moveSlider: function(value) {
    var normalizedValue = value - this.data.minValue / (this.data.maxValue - this.data.minValue);
    var position = this.convertRange(value, this.data.minValue, this.data.maxValue, -this.data.width/2, this.data.width/2);
    this.sliderButton.setAttribute("position", {x:position});
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