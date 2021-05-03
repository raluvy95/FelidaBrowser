const { BrowserWindow, ipcMain, app } = require("electron")
const history = (top) => {
	const win = new BrowserWindow({
		webPreferences: {
			contextIsolation: false,
			nodeIntegration: true
		},
		parent: top,
		modal: true,
		show: false,
		width: 500,
		height: 250,
		title: 'Browsing history',
		icon: './assets/icon.png'
	})
	
	win.maximizable = true;
	win.minimizable = false;
	win.resizable = true;
	
	win.webContents.openDevTools()
	
	ipcMain.on('update', (event) => {
		event.reply('update', app.getVersion(), process.versions.chrome, process.versions.electron, process.versions.node)
	})
	
	win.loadFile('views/about.html')
		win.once("ready-to-show", () => {
			win.show()
			win.focus()
	})
}

module.exports = history
