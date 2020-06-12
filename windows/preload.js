const {
    ipcRenderer,
    ipcMain
} = require("electron");
const s = require("./../settings.json")
function init() {
    if(s.custombackground.url) {
      document.body.style.backgroundImage = `url(${s.custombackground.url})`
    }
}
init()