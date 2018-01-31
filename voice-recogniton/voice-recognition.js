// ----------- SYSTEM -------------
AFRAME.registerSystem('voice-recognition', {
	schema: {},

	init: function() {
		var bla = 1;
		window.voiceRecognitionSystem = this;
		this.setupSpeechRecognition();
		this.entities = new Map();
		this.targetPosition = new THREE.Vector3();
		this.toBeMoved = [];
		this.toMove = new THREE.Vector3();
	},

	tick: function(time, deltaTime) {
		//this.toBeMoved.forEach(function(element){}).bind(this);
		//console.log(this.toBeMoved);
		// for (var i = 0; i < this.toBeMoved.length; ++i) {
		// 	console.log(this.toBeMoved[i].el)
		// 	var moveEl = this.toBeMoved[i].el;
		// 	this.toMove.copy(moveEl.toMove);

		// 	this.toMove.multiplyScalar(deltaTime);
		// 	moveEl.toMove.sub(this.toMove);


		// 	this.toBeMoved[i].el.setAttribute("position", this.toBeMoved[i].toMove);
		// 	this.toBeMoved.splice(i, 1);
		// }
	},

	registerMe: function(name, el) {
		this.entities.set(name, el);
	},

	unregisterMe: function(name) {
		this.entities.delete(name);
	},

	move: function(targetName, movementVector) {
		//var target = this.entities.get(targetName);
		/*this.entities.forEach(function(element) {
			console.log(element);
			console.log(element.el.components.position.data);

			var movementVector = new THREE.Vector3(2, 2, -2);

			//this.toBeMoved.push({el: element, toStillMove: new THREE.Vector3(), toMove: movementVector});
			element.move(movementVector);
			//console.log(this.targetPosition);
			//element.setAttribute("position", this.targetPosition);
		}.bind(this));*/

		var target = this.entities.get(targetName);
		if (target) {
			console.log(targetName, ": ", target);
			target.move(movementVector);
		}
		
	},

	moveToStartingPoint: function(targetName) {
		console.log("moveToStartingPoint called");
		var target = this.entities.get(targetName);
		if (target) {
			console.log(targetName, ": ", target);
			target.moveToStartingPoint();
		}
	},

	setupSpeechRecognition: function() {
		this.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
		if (this.SpeechRecognition) {
			this.recognition = new this.SpeechRecognition();

			this.recognition.lang = 'en-US';
			this.recognition.interimResults = true;
			this.recognition.continuous = false;

			// LISTENERS
			this.recognition.addEventListener('result', this.onRecognition.bind(this));
			//this.recognition.addEventListener('speechend', this.onSpeechEnd);
			var testfunc = function(e) {
				console.log("Recogntion End Event Fired!");
				if (!this.recognitionShouldBeStopped) {
					this.startRecognizing();
				}
			}.bind(this);
			this.recognition.addEventListener('end', testfunc);
			//this.recognition.addEventListener('speechstart', this.onSpeechEnd);


			// DEBUG
			window.recognition = this.recognition;

			//console.log(this.recognition);
			this.startRecognizing();
		}
	},

	onRecognition: function(e) {
		var last = e.results.length - 1;
        var currentWord = e.results[last][0].transcript;
        //console.log(currentWord);

        //console.log(e.results);

        //console.log(currentWord);
        var event = e;
        for (var i = event.resultIndex; i < event.results.length; ++i) {      
	        if (event.results[i].isFinal) { //Final results
	            console.log("final results: " + event.results[i][0].transcript);   //Of course – here is the place to do useful things with the results.

	            var sentence = event.results[i][0].transcript;
	            sentence = sentence.toLowerCase();
	            var words = sentence.split(" ");
	            if(words[0] == "move") {
			    	console.log("Move Statement entered!");
			    	var x = e.results.length >= 2 ? parseFloat(e.results) : 0;
			    	var y = e.results.length >= 3 ? parseFloat(e.results) : 0;
			    	var z = e.results.length >= 4 ? parseFloat(e.results) : 0;

			    	var movementVector = new THREE.Vector3(
			    		!isNaN(x) ? x : 10,
			    		!isNaN(y) ? y : 10,
			    		!isNaN(z) ? z : 10);
			    	// this.move("blue box", movementVector);

			    	// TEST CODE TO BE UPDATED

			    	movementVector = new THREE.Vector3(2, 2, 2);
			    	var target = "blue box";
			    	var moveBack = false;
			    	if (words.length >= 4) {
			    		target = words[2] + " " + words[3];
			    		if(words[words.length - 1] == "back") {
			    			console.log("back said");
			    			movementVector.multiplyScalar(-1.0);
			    			moveBack = true;
			    		}
			    	}
			    	if (moveBack) {
			    		this.moveToStartingPoint(target);
			    	} else {
			    		this.move(target, movementVector);
			    	}
			    }
	        } else {   //i.e. interim...
	            console.log("interim results: " + event.results[i][0].transcript);  //You can use these results to give the user near real time experience.
	        } 
	    } //end for loop

	},

	onSpeechEnd: function(e) {
		console.log("Speech ended!");
		console.log(e);
	},

	startRecognizing: function() {
		this.recognitionShouldBeStopped = false;
		console.log("Starting Recogntion...");
		if (this.recognition) this.recognition.start();
	},

	stopRecognizing: function() {
		this.recognitionShouldBeStopped = true;
		if (this.recognition) this.recognition.stop();
	}
});

// ----------- COMPONENT -------------

AFRAME.registerComponent('voice-recognition', {
	schema: {
		name: {type: "string"},
	},
	init: function() {
		this.movementVector = new THREE.Vector3();
		this.toStillMove = new THREE.Vector3(0, 0, 0);
		this.movementIncrement = new THREE.Vector3();
		this.currentPosition = new THREE.Vector3();

	},

	update: function(oldData) {
		// Register with system

		if (oldData.name) {
			this.system.unregisterMe(oldData.name);
		}

		this.system.registerMe(this.data.name, this);
		this.startingPoint = this.el.components.position.data;
		console.log("starting Point: ", this.startingPoint);
		window.startingPoint = this.startingPoint;

		// this.system.move(this.data.name, new THREE.Vector3(2, 2, 2));
		//this.moveTo(new THREE.Vector3(0, 0, 0));
	},

	tick: function(time, deltaTime) {
		if (!(this.toStillMove.x === 0 && this.toStillMove.y === 0 && this.toStillMove.z === 0)){
			this.currentPosition.copy(this.el.components.position.data);
			this.movementIncrement.copy(this.movementVector);
			this.movementIncrement.normalize();
			this.movementIncrement.multiplyScalar(deltaTime * 0.001);


			var xNegCurrent = this.toStillMove.x < 0;
			var yNegCurrent = this.toStillMove.y < 0;
			var zNegCurrent = this.toStillMove.z < 0;
			this.toStillMove.sub(this.movementIncrement);
			//console.log(this.toStillMove);
			var xNegNext = this.toStillMove.x < 0;
			var yNegNext = this.toStillMove.y < 0;
			var zNegNext = this.toStillMove.z < 0;

			if(xNegNext != xNegCurrent) this.toStillMove.x = 0;
			if(yNegNext != yNegCurrent) this.toStillMove.y = 0;
			if(zNegNext != zNegCurrent) this.toStillMove.z = 0;


			this.currentPosition.add(this.movementIncrement);
			this.el.setAttribute("position", this.currentPosition);
			//console.log(this.currentPosition);
		}
	},

	move: function(movementVector) {
		this.movementVector.copy(movementVector);
		this.toStillMove.copy(movementVector);
		this.movementIncrement.copy(movementVector);

		console.log("Move was called on Component");
	},

	moveTo: function(pointVector) {
		var movementVector = new THREE.Vector3();
		movementVector.subVectors(pointVector, this.el.components.position.data);
		this.move(movementVector);
	},

	moveToStartingPoint: function() {
		console.log("moveToStartingPoint called");
		this.moveTo(this.startingPoint);
	}
});
