console.log('Loading libraries...')
const { BrowserWindow, BrowserView, app, ipcMain } = require('electron')
const menu = require('./menu.js')
const about = require('./about.js')
const settings = require('./settings.js')

class FelidaBrowser {
	preload() {
		console.log('Preloading browser...')

		app.on('window-all-closed', () => { app.quit() });
		//app.userAgentFallback = ''
		//TODO : FIX!

		this.activeTab = -1
		this.tabs = []

		this.mainWindow = new BrowserWindow({
			width: 800,
			height: 600,
			webPreferences: {
				contextIsolation: false,
				nodeIntegration: true
			}
		});

		menu(this.mainWindow)

		// Tabs
		this.etabsView = new BrowserView({
			webPreferences: {
				contextIsolation: false,
				nodeIntegration: true
			},
			darkTheme: true
		});
		this.etabsView.webContents.loadFile('views/tabs.html');
		this.mainWindow.addBrowserView(this.etabsView);
		//this.etabsView.webContents.openDevTools()

		this.mainWindow.on('resize', () => { this.updateSizes(); });
		this.mainWindow.on('goURL', (url) => { this.goURL(url); });

		this.mainWindow.on('tabBackward', () => {
			if (this.tabs[this.activeTab].webContents.canGoBack()) this.tabs[this.activeTab].webContents.goBack()
		})
		this.mainWindow.on('tabForward', () => {
			if (this.tabs[this.activeTab].webContents.canGoForward()) this.tabs[this.activeTab].webContents.goForward()
		})

		this.mainWindow.on('about', () => {
			about(this.mainWindow)
		})

		this.mainWindow.on('settings', () => {
			settings(this.mainWindow)
		})

		ipcMain.on('newTab', (event) => {
			console.log(`adding tab`)
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
		//this.mainWindow.on('')

		ipcMain.on('getURL', (event, id) => {
			let a = this.tabs[id].webContents
			if (a == null) { event.returnValue = ''; return; }
			event.returnValue = a.getURL()
		})

		ipcMain.on('goURL', (event, url) => { this.goURL(url) })
		ipcMain.on('tabForward', (event) => { })

		ipcMain.on('setSelectedTab', (event, id, title) => {
			if (this.activeTab > -1) {
				this.mainWindow.removeBrowserView(this.tabs[this.activeTab])
			}
			this.activeTab = id;
			this.mainWindow.addBrowserView(this.tabs[this.activeTab])
			this.updateSizes();
			event.reply('setSelectedTab', id, this.mainWindow.getBrowserViews()[1].webContents.getTitle())

		})

		this.updateSizes();
	}

	goURL(url) // on active tab
	{
		console.log(`changing card ${this.activeTab} to ${url}`)
		console.log(this.tabs, this.activeTab, url)
		if (!(url.startsWith('http://') || url.startsWith('https://') || url.startsWith('file://')))
			url = 'https://' + url // for security reasons: https:// is the default
		this.tabs[this.activeTab].webContents.loadURL(url)
		this.updateSizes();
	}

	updateSizes() {
		let size = this.mainWindow.getSize();
		this.etabsView.setBounds({ x: 0, y: 0, width: size[0], height: 500 });
		if (this.activeTab > -1) {
			this.tabs[this.activeTab].setBounds({ x: 0, y: 100, width: size[0], height: size[1] - 120 });
		}
	}

	newTab() {
		let id = this.tabs.length
		let newTab = new BrowserView({
			webPreferences: {
				contextIsolation: true,
				nodeIntegration: false
			}
		});
		let size = this.mainWindow.getSize();
		newTab.setBounds({ x: 0, y: 100, width: size[0], height: size[1] - 20 });
		newTab.webContents.loadFile('views/index.html')

		this.tabs.push(newTab)
		this.updateSizes();

		return (id);
	}
	run() {
		console.log('App started')
	}
}

app.on('ready', () => {
	console.log('App ready; Creating instance')
	Browser = new FelidaBrowser();
	Browser.preload();
	Browser.run();
});
console.log('Libs loaded; Waiting for app to be ready')
