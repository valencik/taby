//Attach listeners to each panel option container
var panelOptions = document.getElementsByClassName("optionContainer");
for(i=0 ; i<panelOptions.length ; i++){
    panelOptions[i].addEventListener("click", function(){processEvent(this)}, false);
}

//Handle a click on a panel option
function processEvent(item){
    option = item.id;
    self.port.emit("panelAction", option);
}
