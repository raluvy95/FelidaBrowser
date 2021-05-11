if (process.argv.includes('--help')) {
	console.log('--log Runs app with logs')
	process.exit()
}

let logger = null
if (process.argv.includes('--log')) { logger = require('./logger.js').log; } else { logger = require('./logger.js').nolog; }

let blocker = null

console.log('Loading libraries...')
const { BrowserWindow, BrowserView, app, ipcMain, Menu, session } = require('electron')
const { ElectronBlocker, fullLists, Request } = require("@cliqz/adblocker-electron")
const fetch = require("node-fetch")
const { promises } = require('fs');
const fs = require("fs")
const contextMenu = require('electron-context-menu');
const about = require('./about.js')
const settings = require('./settings.js')
const history = require('./history.js')
const moremenu = require('./moremenu.js')
let browserSettings = settings.data()

class FelidaBrowser {
	preload() {
		logger('Preloading browser...')

		app.on('window-all-closed', () => { app.quit() }); // Quit browser after closing all windows

		this.defaultUserAgetFallback = app.userAgentFallback

		this.tabs = {} // This contains all tabs in format:
		/*
			{
				unixTime: [electron.BrowserView Object]
			}
			unixTime points to unix time of tab creation time
		 */
		this.activeTab = -1 // This points to unix time, but at start is -1

		this.dataToSend = {} // This contains data that will be send to tabs.
		/*
			{
				TabID: { title: 'New Title', favicon: newFavicon }
				'canGoBack': True/False
				'canGoForward': True/False
				'isLoading': True/False
			}
		*/

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

		//this.etabsView.webContents.openDevTools()

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
		this.mainWindow.on('history', () => { this.history() })
		this.mainWindow.on('moremenu', (event) => { this.moremenu() })
		ipcMain.on('about', (event) => { this.about() })
		ipcMain.on('settings', (event) => { this.settings() })
		ipcMain.on('history', (event) => { this.history() })
		ipcMain.on('moremenu', (event) => { this.moremenu() })

		ipcMain.on('updatesettings', (event, d) => {
			browserSettings = d
			logger(browserSettings)
			this.updateSettings()
		})

		ipcMain.on('getDefaultSearchEngine', (event) => {
			logger(browserSettings)
			event.returnValue = browserSettings.defaultSearch
		})

		ipcMain.on("reqClear", (event) => {
			logger("Cleared!")
			session.defaultSession.clearCache()
			session.defaultSession.clearAuthCache()
			session.defaultSession.clearHostResolverCache()
		})

		ipcMain.on('checkData', (event) => {
			try {
				this.dataToSend['canGoBack'] = this.tabs[this.activeTab].webContents.canGoBack()
				this.dataToSend['canGoForward'] = this.tabs[this.activeTab].webContents.canGoForward()
				this.dataToSend['isLoading'] = this.tabs[this.activeTab].webContents.isLoading()
			} catch (e) { }
			if (this.dataToSend != {}) {
				event.returnValue = this.dataToSend;
				this.dataToSend = {}
			}
			event.returnValue = null;
		})


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

		this.updateSizes();
		this.updateSettings();
	}

	settings() {
		logger(`Opening settings page`);
		settings.open(this.mainWindow);
	}

	about() {
		logger(`Opening about page`);
		about(this.mainWindow);
	}

	history() {
		logger(`Opening history page`);
		history(this.mainWindow);
	}

	moremenu() {
		logger(`Opening moremenu page`)
		moremenu(this.mainWindow)
	}

	goURL(url) // on active tab
	{
		logger(`Moving tab ${this.activeTab} from ${this.tabs[this.activeTab].webContents.getURL()} to ${url}`)
		if (!(url.startsWith('http://') || url.startsWith('https://') || url.startsWith('file://') || url.startsWith('chrome://')))
			url = 'https://' + url // for security reasons: https:// is the default

		this.tabs[this.activeTab].webContents.loadURL(url, { userAgent: app.userAgentFallback })
		this.updateSizes();

		// log to history
		fs.appendFile(`./history.json`, `${Date.now()}\r\n${this.tabs[this.activeTab].webContents.getTitle()}\r\n${url}\r\n`, function (err) {
			if (err) throw err;
		});
	}

	updateSizes() {
		let size = this.mainWindow.getSize();
		this.etabsView.setBounds({ x: 0, y: 0, width: size[0], height: 100 });
		if (this.activeTab > -1) {
			this.tabs[this.activeTab].setBounds({ x: 0, y: 100, width: size[0], height: size[1] - 100 });
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
		newTab.setBounds({ x: 0, y: 100, width: size[0], height: size[1] });
		newTab.webContents.loadFile('views/index.html')

		function updateData(dts) {
			if (dts[id] == null) dts[id] = {}
			dts[id].title = newTab.title;
			dts[id].favicons = newTab.favicons;
			return dts
		}

		newTab.webContents.on('page-title-updated', (event, title, explicitSet) => {
			logger(`Tab ${id} changed title to ${title}`)
			newTab.title = title
			this.dataToSend = updateData(this.dataToSend)
		})

		newTab.webContents.on('page-favicon-updated', (event, favicons) => {
			logger(`Tab ${id} changed favicons to ${favicons}`)
			newTab.favicons = favicons
			this.dataToSend = updateData(this.dataToSend)
		})


		this.tabs[id] = newTab
		this.updateSizes();
		contextMenu({
			window: newTab,
			showCopyImage: true,
			showCopyImageAddress: true,
			showSaveImageAs: true,
			showSearchWithGoogle: true
		});

		return (id);
	}

	run() {
		logger('App started')
	}

	close() {
		logger('Closing browser')
		app.quit()
	}

	updateSettings() {
		// what to do on settings update
		
		if (browserSettings.AdBlockEnable) {
			try { blocker.enableBlockingInSession(session.defaultSession); } catch (e) { }
		}
		else {
			try { blocker.disableBlockingInSession(session.defaultSession); } catch (e) { }
		}

		if (browserSettings.UserAgent != null) app.userAgentFallback = browserSettings.UserAgent
		else app.userAgentFallback = this.defaultUserAgetFallback
		for (const [k, v] of Object.entries(this.tabs)) {
			v.webContents.setUserAgent(app.userAgentFallback)
		}
	}
}

app.allowRendererProcessReuse = false;

app.on('ready', async () => {
	logger('App ready; Creating instance')

	if (session.defaultSession === undefined) {
		throw new Error('defaultSession is undefined');
	}

	blocker = await ElectronBlocker.fromLists(fetch, fullLists, { enableCompression: true }, {
		path: 'engine.bin',
		read: promises.readFile,
		write: promises.writeFile,
	});

	blocker.on('request-blocked', (request) => {
		logger(`Blocked Ad, tab ID: ${request.tabId}, Ad URL: ${request.url}`);
	});

	Browser = new FelidaBrowser();
	Browser.preload();
	Browser.run();
});
logger('Libs loaded; Waiting for app to be ready')
