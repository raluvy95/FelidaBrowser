if (process.argv.includes('--help')) {
	console.log('--log Runs app with logs')
	process.exit()
}

let logger = null
if (process.argv.includes('--log')) { logger = require('./logger.js').log; } else { logger = require('./logger.js').nolog; }

console.log('Loading libraries...')
const { BrowserWindow, BrowserView, app, ipcMain, Menu } = require('electron')
const about = require('./about.js')
const settings = require('./settings.js')

class FelidaBrowser {
	preload() {
		logger('Preloading browser...')

		app.on('window-all-closed', () => { app.quit() }); // Quit browser after closing all windows

		// We need this for hacking google services, so they let's us login, but i'm having currently some problems with it (see: https://github.com/raluvy95/FelidaBrowser/issues/2)
		//app.userAgentFallback = ''
		//TODO : FIX!

		this.tabs = {} // This contains all tabs in format:
		/*
			{
				unixTime: [electron.BrowserView Object]
			}
			unixTime points to unix time of tab creation time
		 */
		this.activeTab = -1 // This points to unix time, but at start is -1

		// Creating main window
		// TODO: Base it on last its location
		this.mainWindow = new BrowserWindow({
			width: 800,
			height: 600,
			webPreferences: {
				contextIsolation: false,
				nodeIntegration: true
			},
			title: 'Felida Browser',
			icon: './assets/icon.png',
			show: false,
		});

		this.mainWindow.once("ready-to-show", () => {
			this.mainWindow.show()
			this.mainWindow.focus()
		})
		this.mainWindow.maximize()

		// Remove menu
		Menu.setApplicationMenu(null)

		// Create etabsView for tabs
		this.etabsView = new BrowserView({
			webPreferences: {
				contextIsolation: false,
				nodeIntegration: true
			}
		});
		this.etabsView.webContents.loadFile('views/tabs.html');

		this.etabsView.webContents.openDevTools()

		this.mainWindow.addBrowserView(this.etabsView);

		this.mainWindow.on('resize', () => { this.updateSizes(); }); // update sizes when resizing window
		this.mainWindow.on('goURL', (url) => { this.goURL(url); });

		this.mainWindow.on('tabBackward', () => { // backward button
			if (this.tabs[this.activeTab].webContents.canGoBack()) this.tabs[this.activeTab].webContents.goBack()
			logger(`Going back on tab ${this.activeTab}`)
		})
		this.mainWindow.on('tabForward', () => { // forward button
			if (this.tabs[this.activeTab].webContents.canGoForward()) this.tabs[this.activeTab].webContents.goForward()
			logger(`Going forward on tab ${this.activeTab}`)
		})

		// About and Settings page
		this.mainWindow.on('about', () => { this.about() })
		this.mainWindow.on('settings', () => { this.settings() })

		ipcMain.on('newTab', (event) => {
			this.updateSizes();
			event.returnValue = this.newTab();
		})
		ipcMain.on('goBack', (event) => {
			this.updateSizes();
			this.mainWindow.emit('tabBackward')
		})
		ipcMain.on('goForward', (event) => {
			this.updateSizes();
			this.mainWindow.emit('tabForward')
		})
		ipcMain.on("refresh", (event) => {
			logger(`Refreshing active tab ${this.activeTab}`)
			this.tabs[this.activeTab].webContents.reload()
			if (!this.tabs[this.activeTab].webContents.isLoading()) return;
		})
		ipcMain.on('getURL', (event, id) => {
			if (this.tabs[id] == null || this.tabs[id].webContents == null) { event.returnValue = ''; return; }
			let url = this.tabs[id].webContents.getURL()
			if (url == `file://${__dirname}/views/index.html`) url = ''
			event.returnValue = url
		})

		ipcMain.on('closeTab', (event, id) => {
			logger(`Closing tab ${id}`)
			if (this.activeTab == id) { this.close(); return }
			delete this.tabs[id]
		})

		ipcMain.on('closeBrowser', (event) => {
			this.close()
		})

		ipcMain.on('goURL', (event, url) => { this.goURL(url) })

		ipcMain.on('setSelectedTab', (event, id, title) => {
			if (this.activeTab > -1) {
				this.mainWindow.removeBrowserView(this.tabs[this.activeTab])
			}
			this.activeTab = id;
			this.mainWindow.addBrowserView(this.tabs[this.activeTab])
			this.updateSizes();
			event.reply('setSelectedTab', id)

		})
		ipcMain.on('settings', (event) => { this.settings() })

		this.updateSizes();
	}

	settings() {
		logger(`Opening settings page`);
		settings(this.mainWindow);
	}

	about() {
		logger(`Opening about page`);
		about(this.mainWindow);
	}

	goURL(url) // on active tab
	{
		logger(`Moving tab ${this.activeTab} from ${this.tabs[this.activeTab].webContents.getURL()} to ${url}`)
		if (!(url.startsWith('http://') || url.startsWith('https://') || url.startsWith('file://')))
			url = 'https://' + url // for security reasons: https:// is the default
		this.tabs[this.activeTab].webContents.loadURL(url)
		this.updateSizes();
	}

	updateSizes() {
		let size = this.mainWindow.getSize();
		this.etabsView.setBounds({ x: 0, y: 0, width: size[0], height: 500 });
		if (this.activeTab > -1) {
			this.tabs[this.activeTab].setBounds({ x: 0, y: 160, width: size[0], height: size[1] - 140 });
		}
	}

	newTab() {
		let id = Date.now()
		logger(`New tab, id: ${id}`)
		let newTab = new BrowserView({
			webPreferences: {
				contextIsolation: true,
				nodeIntegration: false
			}
		});
		let size = this.mainWindow.getSize();
		newTab.setBounds({ x: 0, y: 100, width: size[0], height: size[1] - 20 });
		newTab.webContents.loadFile('views/index.html')

		this.tabs[id] = newTab
		this.updateSizes();

		return (id);
	}

	run() {
		logger('App started')
	}

	close() {
		logger('Closing browser')
		app.quit()
	}
}

app.on('ready', () => {
	logger('App ready; Creating instance')
	Browser = new FelidaBrowser();
	Browser.preload();
	Browser.run();
});
logger('Libs loaded; Waiting for app to be ready')
