const { BrowserWindow, ipcMain, app } = require("electron")
const settings = (top) => {
	const win = new BrowserWindow({
		webPreferences: {
			contextIsolation: false,
			nodeIntegration: true
		},
		parent: top,
		modal: true,
		show: false,
		width: 700,
		height: 500
	})
	
	win.setMenu(null)
	win.maximizable = false;
	win.minimizable = false;
	win.resizable = false;
	
	//win.webContents.openDevTools()
	
	win.loadFile('views/settings.html')
		win.once("ready-to-show", () => {
			win.show()
			win.focus()
	})
}

module.exports = settings
