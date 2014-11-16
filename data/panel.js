//Attach listeners to each panel option container
var panelOptions = document.getElementsByClassName("optionContainer");
for(i=0 ; i<panelOptions.length ; i++){
    panelOptions[i].addEventListener("click", function(){processEvent(this)}, false);
}

//Handle a click on a panel option
function processEvent(item){
    option = item.id;
    content = null;

    if (option == 'save') {
        content = {
            username: document.getElementById("username").value,
            password: document.getElementById("password").value,
            repository: document.getElementById("repository").value
        }
    }

    self.port.emit("panelAction", option, content);
}
