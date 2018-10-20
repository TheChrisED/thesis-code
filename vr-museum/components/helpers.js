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

// Applies Anisotropic filtering to textures attached to the model.
// Currently only gets executed once after the materialtextureloaded event
// materialtextureloaded Event has to be fired after model was loaded.
// Might not work with all importers. 
AFRAME.registerComponent('anisotropic-filtering', {
  schema: {
    src: {type: 'selector'},
    anisotropy: {default: -1},
  },
  dependencies: ["geometry", "material"],

  init: function(){
  	this.el.addEventListener("materialtextureloaded", this.setAnisotropy.bind(this));
  },

  update: function(oldData){
  	var maxAnisotropy = this.el.sceneEl.renderer.capabilities.getMaxAnisotropy();
  	if (this.data.anisotropy < 0 || this.data.anisotropy > maxAnisotropy)
  		this.data.anisotropy = maxAnisotropy;
  },

  setAnisotropy: function(){
  	var anisotropy = this.data.anisotropy;
  	var meshGroup = this.el.object3D;
  	meshGroup.traverse(function(object){
  		if ( object.isMesh === true ) {
      		object.material.map.anisotropy = anisotropy;
   		}
  	});
  },
});