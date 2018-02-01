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
      this.uiComponent.el.setAttribute("visible", "true");
      this.controlsVisible = true;
      this.activateTimeout();
    }
  },
  hideControls: function() {
    this.uiComponent.el.setAttribute("visible", "false");
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
    playPauseButton: {type: "selector"}
  },
  init: function () {
    this.data.playPauseButton.addEventListener("click", this.playPause.bind(this));
    
  },
  play: function () {
    this.data.controller.components["pip-video-interface"].registerUI(this);
  },
  pause: function () {         
  },
  tick: function (time, deltaTime) {
  },
  bringUpControls: function() {
    if (!this.controlsVisible) {
      this.data.uiControls.setAttribute("visible", "true");
      this.controlsVisible = true;
    }
  },
  playPause: function() {
    var interfaceComponent = this.data.controller.components["pip-video-interface"];
    interfaceComponent.toggleVideos();
  }
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