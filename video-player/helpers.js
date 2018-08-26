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
			//console.log(event);
			if (event.isTrusted)
				return;
			if (event.target.hasAttribute("cursor"))
				//console.log("Cursor Element Target", event.detail.intersectedEl);
				return;

			console.log(event);

			if (this.isInsideListenerTargets(event.target)) {
				console.log("Event occured inside target");
			} else {
				console.log("Event occured outside target");
				callback(event);
			}
			// if (!(event.target === this.target || this.isParent(this.target, event.target))) {
			// 	console.log("Event occured outside target");
			// 	callback(event);
			// } else {
			// 	console.log("Event occured inside target");
			// }
		}.bind(this);
		document.addEventListener(eventType, outsideCallback);
	};

	this.isInsideListenerTargets = function(element) {
		console.log(this.targets[0]);
		for (var i = 0; i < this.targets.length; ++i) {
			var target = this.targets[i];
			console.log("Target: ", target);
			console.log("Element: ", element);
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
};