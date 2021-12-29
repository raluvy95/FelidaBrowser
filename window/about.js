const { BrowserWindow, ipcMain, app } = require("electron")
const about = (top) => {
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
	
	ipcMain.on('update', (event) => {
		event.reply('update', app.getVersion(), process.versions.chrome, process.versions.electron, process.versions.node)
	})
	
	ipcMain.on("aboutClose", (e) => {
		win.close()
	})

	win.loadFile('views/about.html')
		win.once("ready-to-show", () => {
			win.show()
			win.focus()
	})
}

module.exports = about
