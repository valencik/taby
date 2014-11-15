console.log("Loading panel.js");

var i;
var panelOptions = document.getElementsByTagName("li");

for(i=0 ; i<panelOptions.length ; i++){
    console.log("Attaching listener to:"+panelOptions[i].innerHTML);
    panelOptions[i].addEventListener("click", function(){processEvent(this)}, false);
}

function processEvent(item){
    option = item.innerHTML;
    self.port.emit("panelAction", option);
}