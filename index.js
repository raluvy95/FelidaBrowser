const {app, BrowserWindow} = require("electron")
require("dotenv").config()
//const tab = require("./Class/Tab.js")
//const Tab = new tab()
const win = require("./windows/window.js")

app.on('ready', function() {
    win()
})

app.on('window-all-closed', () => {
    if(process.platform !== 'darwin') {
        app.quit()
    }
})
app.on('activate', () => {
    if(BrowserWindow.getAllWindows().length === 0) {
       win()
    }
})