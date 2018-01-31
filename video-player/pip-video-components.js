AFRAME.registerComponent('follow-rotation', {
  schema: {
    entity: {type: "selector"},
    x: {default: true},
    y: {default: true},
    z: {default: true},
  },
  init: function () {
    this.el.setAttribute("position", this.data.entity.components.position.data);
  },
  play: function () {
  },
  pause: function () {         
  },
  tick: function (time, deltaTime) {
    var newRotation = {
      x: this.el.components.rotation.data.x,
      y: this.data.entity.components.rotation.data.y,
      z: this.el.components.rotation.data.z,
    };
    this.el.setAttribute("rotation", newRotation);
  }
});