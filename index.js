console.log('Loading libraries...')
const { BrowserWindow, BrowserView, app, ipcMain } = require('electron')
const menu = require('./menu.js')
const about = require('./about.js')
const settings = require('./settings.js')

class FelidaBrowser {
	preload() {
		console.log('Preloading browser...')

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
		this.activeTab = -1 // Tjis points to unix time, but at start is -1
		
		// Creating main window
		// TODO: Base it on last its location
		this.mainWindow = new BrowserWindow({
			width: 800,
			height: 600,
			webPreferences: {
				contextIsolation: false,
				nodeIntegration: true
			}
		});
		
		// Add menu
		menu(this.mainWindow)

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
		})
		this.mainWindow.on('tabForward', () => { // forward button
			if (this.tabs[this.activeTab].webContents.canGoForward()) this.tabs[this.activeTab].webContents.goForward()
		})

		// About and Settings page
		this.mainWindow.on('about', () => { about(this.mainWindow) })
		this.mainWindow.on('settings', () => { settings(this.mainWindow) })

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

		ipcMain.on('getURL', (event, id) => {
			if (this.tabs[id] == null || this.tabs[id].webContents == null) { event.returnValue = ''; return; }
			let url = this.tabs[id].webContents.getURL()
			if(url == `file://${__dirname}/views/index.html`) url = ''
			event.returnValue = url
		})
		
		ipcMain.on('closeTab', (event, id) => {
			if(this.activeTab == id) { console.log(`Can't delete active tab! ID: ${id}`); return }
			delete this.tabs[id]
		})
		
		ipcMain.on('closeBrowser', (event) => {
			this.close()
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
			event.reply('setSelectedTab', id)

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
			console.log(this.tabs,this.activeTab)
			this.tabs[this.activeTab].setBounds({ x: 0, y: 120, width: size[0], height: size[1] - 140 });
		}
	}

	newTab() {
		let id = Date.now()
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
		console.log('App started')
	}
	
	close() {
		console.log('Closing browser')
		app.quit()
	}
}

app.on('ready', () => {
	console.log('App ready; Creating instance')
	Browser = new FelidaBrowser();
	Browser.preload();
	Browser.run();
});
console.log('Libs loaded; Waiting for app to be ready')
