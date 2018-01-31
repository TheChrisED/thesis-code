window.onload = init;

var skybox;

function init() {
	console.log("Initialization...");
	document.addEventListener("keydown", changeBackground);
	skybox = document.getElementById("skybox");
}

function changeBackground(){
    //skybox.setAttribute("src", "SonyCenter_360panorama.jpg");
    console.log(skybox.getAttribute("src"));
    if (skybox.getAttribute("src") == "puydesancy.jpg") {
    	console.log("Franzland");
    	skybox.setAttribute("src", "SonyCenter_360panorama.jpg");
    } else {
    	skybox.setAttribute("src", "puydesancy.jpg");
    }
}