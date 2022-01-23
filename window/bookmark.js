const { BrowserWindow, ipcMain, app } = require("electron")
const bookmark = (top) => {
	const win = new BrowserWindow({
		webPreferences: {
			contextIsolation: false,
			nodeIntegration: true
		},
		parent: top,
		modal: true,
		show: false,
		width: 500,
		height: 300,
		title: 'Felida Browser',
		icon: './assets/icon.png'
	})
	
	win.maximizable = false;
	win.minimizable = false;
	win.resizable = false;
	
	//win.webContents.openDevTools()

	win.loadFile('views/bookmark.html')
		win.once("ready-to-show", () => {
			win.show()
			win.focus()
	})
}

module.exports = bookmark
