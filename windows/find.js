const {BrowserWindow} = require("electron")
const y = () => {
    const win = new BrowserWindow({
		webPreferences: {
			nodeIntegration: true
		},
        frame: false,
        width: 500,
        height: 250
    })
    win.loadURL("file:///" + __dirname + "./../views/find.html")
    win.once("ready-to-show", () => {
        win.show()
        win.focus()
    })
}

module.exports = y