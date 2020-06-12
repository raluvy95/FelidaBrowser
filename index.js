const {app, BrowserWindow} = require("electron")
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
