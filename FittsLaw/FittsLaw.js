// Only works when the targets are fully loaded before the component gets initialized
// i.e. <a-entity class="target"></a-entity> <a-entity fitts-law="targets: .target"></a-entity> 
AFRAME.registerComponent('fitts-law', {
	schema: {
		targets: {type: "selectorAll"},
		speed: {type: "number", default: 1}
	},

	init: function() {
		var targets = this.data.targets;
		this.nextTarget = 0;
		this.numTargets = targets.length;
	},

	update: function() {
		var targets = this.data.targets;
		var speed = this.data.speed;
		
		this.nextTarget = 0;
		this.numTargets = targets.length;
		this.movementVec = new THREE.Vector3();
		this.currentPosition = new THREE.Vector3();
		this.currentPosition.copy(this.el.components.position.data);
		this.lastPosition = this.currentPosition;

		console.log(this.currentPosition.angleTo(this.lastPosition));
	},

	tick: function(time, deltaTime) {
		this.nextTargetPos = this.data.targets[this.nextTarget].components.position.data;
		//this.currentPosition = this.el.components.position.data;
		this.currentPosition.copy(this.el.components.position.data);


			this.movementVec.subVectors(this.nextTargetPos, this.currentPosition);
		if (this.movementVec.length() >= 0.05*this.data.speed) {
			this.movementVec.normalize();
			this.movementVec.multiplyScalar(this.data.speed * deltaTime * 0.001);

			this.currentPosition.addVectors(this.currentPosition, this.movementVec);
		} else {
			this.nextTarget = (this.nextTarget + 1) % this.numTargets;
		}

		
		this.el.setAttribute("position", this.currentPosition);
		this.lastPosition = this.currentPosition;
	}
});

