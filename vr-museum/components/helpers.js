AFRAME.registerComponent('checkpoint-redirect', {
  schema: {
    checkpoint: {type: 'selector'},
  },

  init: function(){
  	this.el.addEventListener("click", this.redirectToCheckpoint.bind(this));
  },

  redirectToCheckpoint: function(event) {
  	var targetEl = this.el.sceneEl.querySelector('[checkpoint-controls]');
    if (!targetEl) {
      throw new Error('No `checkpoint-controls` component found.');
    }
    targetEl.components['checkpoint-controls'].setCheckpoint(this.data.checkpoint);
  },
});