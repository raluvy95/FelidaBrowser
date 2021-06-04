const { BrowserWindow, ipcMain, app } = require("electron")
const moremenu = (top) => {
	const win = new BrowserWindow({
		webPreferences: {
			contextIsolation: false,
			nodeIntegration: true
		},
		parent: top,
		show: false,
		frame: false,
		width: 300,
		height: 420,
		title: 'Felida Browser',
		icon: './assets/icon.png'
	})
	
	win.maximizable = false;
	win.minimizable = false;
	win.resizable = false;
	
	//win.webContents.openDevTools()
	
	win.once('blur', () => {
		win.hide()
		setTimeout(() => {win.close()}, 1000)
	})
	
	win.loadFile('views/moremenu.html')
		win.once("ready-to-show", () => {
			win.setAlwaysOnTop(true)
			win.show()
			win.focus()
			win.setBounds({ x: top.getPosition()[0]+top.getSize()[0]-win.getSize()[0],
							y: top.getPosition()[1]+100 })
	})
}

module.exports = moremenu
