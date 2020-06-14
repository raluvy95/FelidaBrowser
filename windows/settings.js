const {app, BrowserWindow} = require("electron")
const settings = require("./../settings.json")
 function f() {
    let win = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        },
        frame: false
    })
    win.loadURL("file:///" + __dirname + "/../views/settings.html")
    win.on("ready-to-show", () => {
        win.show()
        win.focus()
    })
}
module.exports = f