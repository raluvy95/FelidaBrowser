const { BrowserWindow, ipcMain, app } = require("electron")
const fs = require('fs')
const history = (top) => {
	const win = new BrowserWindow({
		webPreferences: {
			contextIsolation: false,
			nodeIntegration: true
		},
		parent: top,
		modal: true,
		show: false,
		width: 700,
		height: 500,
		title: 'Browsing history',
		icon: './assets/icon.png'
	})
	
	win.maximizable = true;
	win.minimizable = false;
	win.resizable = true;

	ipcMain.on('historydata', (event) => {
		fs.readFile('./../data/history.json', 'utf8', function (err, data) {
			if(err)
			{
				return console.log(err);
			}
			event.reply('historydata', data)
		});
	})
	
	win.loadFile('views/history.html')
		win.once("ready-to-show", () => {
			win.show()
			win.focus()
	})
}

module.exports = history
