/**
 * Listens for events on any element outside the specified target or any of its children
 * Known Issue: If an event is fired on a non a-frame element, the event is ignored. Any trusted events are ignored
 */
var OutsideEventListener = function(target) {
	this.target = target;
	this.listeners = new Map();

	this.addOutsideEventListener = function(eventType, callback) {
		var outsideCallback = function(event) {
			if (event.isTrusted)
				return;
			if (event.target.hasAttribute("cursor"))
				return;

			//console.log(event);
			if (!(event.target === this.target || this.isParent(this.target, event.target))) {
				console.log("Event occured outside target");
				callback(event);
			} else {
				console.log("Event occured inside target");
			}
		}.bind(this);
		document.addEventListener(eventType, outsideCallback);
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