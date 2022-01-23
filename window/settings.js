const { BrowserWindow, ipcMain, app } = require("electron")
let logger = null
if (process.argv.includes('--log')) { logger = require('../logger.js').log; } else { logger = require('../logger.js').nolog; }
const fs = require('fs')

function data() {
	try { return JSON.parse(fs.readFileSync(__dirname + '/../data/settings.json', 'utf8')) } catch (e) { return {} }
}

function open(top) {
	logger('From settings.js, settings opened')
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
		title: 'Felida Browser - Settings',
		icon: './assets/icon.png'
	})

	win.maximizable = false;
	win.minimizable = false;
	win.resizable = false;

	//win.webContents.openDevTools()

	ipcMain.once('getsettings', (event) => {
		logger(`Reading ${__dirname}/settings.json`)
		event.reply('updatesettings', data())
	})

	ipcMain.once('updatesettings', (event, d) => {
		fs.writeFile(__dirname + '/../data/settings.json', JSON.stringify(d), function (err) {
			if (err) return logger(err);
			logger('Saved!')
		});
		win.close()
	})

	win.loadFile('views/settings.html')
	win.once("ready-to-show", () => {
		win.show()
		win.focus()
	})
}

module.exports = { open, data }