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

AFRAME.registerComponent('pip-video-interface', {
  schema: {
    video2d: {type: "selector"}
  },
  init: function () {
    console.log("pip-video-interface initialized", this.data.video2d);
    var width = this.data.video2d.getAttribute("width");
    var height = this.data.video2d.getAttribute("height");
    var multiplier = 1;
    console.log("width: ", width);
    width *= multiplier;
    height *= multiplier;
    console.log("new width: ", width);
    this.data.video2d.setAttribute("width", width);
    this.data.video2d.setAttribute("height", height);
  },
  play: function () {
  },
  pause: function () {         
  },
  tick: function (time, deltaTime) {
  }
});