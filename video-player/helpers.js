/**
 * Listens for events on any element outside the specified target or any of its children
 * Known Issue: If an event is fired on a non a-frame element, the event is ignored. Any trusted events are ignored
 */
var OutsideEventListener = function() {

	this.targets = [];
	for (var i = 0; i < arguments.length; ++i) {
		this.targets.push(arguments[i]);
	}
	console.log("OutsideEventListener Targets: ", this.targets);
	this.target = this.targets[0];
	console.log("this.target: ", this.target);
	this.listeners = new Map();

	this.addOutsideEventListener = function(eventType, callback) {
		var outsideCallback = function(event) {
			// Ignore Standard Events from the browser (only want to react to A-Frame events)
			if (event.isTrusted)
				return;
			// Ignore Cursor events, so that function doesn't react to event twice
			if (event.target.hasAttribute("cursor"))
				return;

			if (this.isInsideTargets(event.target)) {
				console.log("Event occured inside target");
			} else {
				console.log("Event occured outside target");
				callback(event);
			}
		}.bind(this);
		document.addEventListener(eventType, outsideCallback);
	};

	this.isInsideTargets = function(element) {
		for (var i = 0; i < this.targets.length; ++i) {
			var target = this.targets[i];
			if (element === target || this.isParent(target, element)) {
				return true;
			}
		}
		return false;
	};

	this.isParent = function(parent, child) {
		var node = child.parentNode;
	     while (node != null) {
	         if (node == parent) {
	             return true;
	         }
	         node = node.parentNode;
	     }
	     return false;
	};

	this.addTarget = function(target) {
		if (!this.targets.includes(target)) {
			this.targets.push(target);
		}
	};

	this.removeTarget = function(target) {
		var index = this.targets.indexOf(target);
		if (index > -1) {
		    this.targets.splice(index, 1);
		    return true;
		} else {
			return false;
		}
	};
};

var convertToDisplayTime = function(timeInSeconds) {

	var decimalMinutes = timeInSeconds / 60.0;
	var minutes = Math.floor(decimalMinutes);
	var seconds = (decimalMinutes - minutes) * 60;
	seconds = Math.floor(seconds);
	var displayTime = minutes < 10? "0" + minutes: "" + minutes;
	displayTime += seconds < 10? ":0" + seconds: ":" + seconds;

	return displayTime;
};