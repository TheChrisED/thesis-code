AFRAME.registerComponent('skybox-gallery', {
  schema: {type: 'array'},

  images: [],
  currentImage: 0,
  numImages: 1,

  init: function () {
    this.images.push(this.el.getAttribute('src'));
    this.images = this.images.concat(this.data);
    this.numImages = this.images.length;
    console.log("skybox-gallery Initialization...");
    var boundChangeBackground = this.changeBackground.bind(this);
	document.addEventListener("keydown", boundChangeBackground);
  },

  changeBackground: function() {
    this.currentImage = (this.currentImage + 1) % this.numImages;
    this.el.setAttribute('src', this.images[this.currentImage]);
  }
});