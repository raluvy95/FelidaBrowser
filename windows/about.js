const {BrowserWindow} = require("electron")
const y = () => {
    const win = new BrowserWindow({
        frame: false,
        width: 500,
        height: 250
    })
    win.loadFile("./../views/about.html")
    win.once("ready-to-show", () => {
        win.show()
        win.focus()
    })
}

module.exports = y