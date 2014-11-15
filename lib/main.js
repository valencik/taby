var buttons = require('sdk/ui/button/action');
var tabs = require("sdk/tabs");

var button = buttons.ActionButton({
  id: "taby-link",
  label: "Visit Taby!",
  icon: {
    "32": "./icon-32.png"
  },
  onClick: handleClick
});

function handleClick(state) {
  tabs.open("https://github.com/valencik/taby");
}
