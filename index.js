if (process.argv.includes('--help')) {
	console.log('--log Runs app with logs')
	process.exit()
}

// process.on('unhandledRejection', error => {
// 	console.log('unhandledRejection', error.message);
// });

let logger = null
if (process.argv.includes('--log')) { logger = require('./logger.js').log; } else { logger = require('./logger.js').nolog; }

let blocker = null

console.log('Loading libraries...')
const { BrowserWindow, BrowserView, app, ipcMain, Menu, session} = require('electron')
const { ElectronBlocker, fullLists, Request } = require("@cliqz/adblocker-electron")
const { promises } = require('fs');
const fs = require("fs")
const contextMenu = require('electron-context-menu');
const about = require('./window/about.js')
const settings = require('./window/settings.js')
const history = require('./window/history.js')
const moremenu = require('./window/moremenu.js')
const bookmark = require('./window/bookmark.js')
const fetch = require("node-fetch")

const BOOKMARKS_TEMPLATE = [
	{
		title: "YouTube",
		icon: "https://www.youtube.com/s/desktop/40777624/img/favicon.ico",
		url: "https://youtube.com"
	},
	{
		title: "GitHub",
		icon: "https://github.githubassets.com/favicons/favicon-dark.png",
		url: "https://github.com"
	},
	{
		title: "Felida Browser",
		icon: "file:///home/raluca/Desktop/devs/FelidaBrowser/assets/icon.png",
		url: "https://github.com/raluvy95/FelidaBrowser"
	},
	{
		title: "Twitter",
		icon: "https://abs.twimg.com/favicons/twitter.2.ico",
		url: "https://twitter.com"
	},
	{
		title: "Facebook",
		icon: "https://static.xx.fbcdn.net/rsrc.php/yb/r/hLRJ1GG_y0J.ico",
		url: "https://facebook.com"
	},
	{
		title: "Reddit",
		icon: "https://www.redditstatic.com/desktop2x/img/favicon/android-icon-192x192.png",
		url: "https://reddit.com"
	}
]

console.log(__dirname)
if(!fs.existsSync(__dirname + '/data/')) {
	// this will create necessary files upon first run
	fs.mkdirSync(__dirname + '/data/')
	fs.appendFileSync(__dirname + '/data/settings.json', '{}')
	fs.appendFileSync(__dirname + '/data/bookmarks.json', JSON.stringify(BOOKMARKS_TEMPLATE))
	fs.appendFileSync(__dirname + '/data/history.json', '')
}


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
		this.mainWindow.setMenu(null)

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
		this.mainWindow.on('bookmark', (event) => { this.bookmark() })
		ipcMain.on('about', (event) => { this.about() })
		ipcMain.on('settings', (event) => { this.settings() })
		ipcMain.on('history', (event) => { this.history() })
		ipcMain.on('moremenu', (event) => { this.moremenu() })
		ipcMain.on('bookmark', (event) => { this.bookmark() })

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
				/* TODO
				this.dataToSend['isConnecting'] = this.tabs[this.activeTab].webContents.isWaitingForResponse()
				*/
			} catch (e) { }
			if (this.dataToSend != {}) {
				event.returnValue = this.dataToSend;
				this.dataToSend = {}
			}
			event.returnValue = null;
		})


		ipcMain.on('newTab', (event, url) => {
			this.updateSizes();
			if(!url) url = `file:///${__dirname}/views/index.html`
			event.returnValue = this.newTab(url);
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
			if (this.tabs[this.activeTab].webContents.isLoading()) return;
			this.tabs[this.activeTab].webContents.reload()
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

		ipcMain.on("getListBookmarks", (event) => {
			let parsed
			if (fs.existsSync(__dirname + '/data/bookmarks.json')) {
				parsed = JSON.parse(fs.readFileSync(__dirname + '/data/bookmarks.json'))
			} else {
				parsed = BOOKMARKS_TEMPLATE
				fs.appendFileSync(__dirname + '/data/bookmarks.json', JSON.stringify(parsed))
			}
			logger(parsed)
			event.returnValue = parsed
		
		})

		ipcMain.on('setListBookmarks', (event, type, value='') => {
			const parsed = JSON.parse(fs.readFileSync(__dirname + "/data/bookmarks.json"))
			switch(type) {
				case 'purge':
					fs.writeFileSync(__dirname + '/data/bookmarks.json', '[]')
					break
				case 'change':
					fs.writeFileSync(__dirname + '/data/bookmarks.json', JSON.stringify(value))
					break
				case 'add':
					parsed.push(value)
					fs.writeFileSync(__dirname + '/data/bookmarks.json', JSON.stringify(parsed))
					break
				case 'remove':
					parsed.splice(parsed.findIndex(m => m.url == value), 1)
					fs.writeFileSync(__dirname + '/data/bookmarks.json', JSON.stringify(parsed))
					break
			}
		})

		ipcMain.on("quit", event => {
			this.close()
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

	bookmark() {
		logger("Opening bookmark page")
		bookmark(this.mainWindow)
	}

	goURL(url) // on active tab
	{
		logger(`Moving tab ${this.activeTab} from ${this.tabs[this.activeTab].webContents.getURL()} to ${url}`)
		if (!(url.startsWith('http://') || url.startsWith('https://') || url.startsWith('file://') || url.startsWith('chrome://')))
			url = 'https://' + url // for security reasons: https:// is the default

		this.tabs[this.activeTab].webContents.loadURL(url, { userAgent: app.userAgentFallback })
		this.updateSizes();

		// log to history
		fs.appendFile(`${__dirname}/data/history.json`, `${Date.now()}\r\n${this.tabs[this.activeTab].webContents.getTitle()}\r\n${url}\r\n`, function (err) {
			if (err) throw err;
		});
	}

	updateSizes() {
		let size = this.mainWindow.getSize();
		this.etabsView.setBounds({ x: 0, y: 0, width: size[0], height: 120 });
		if (this.activeTab > -1) {
			this.tabs[this.activeTab].setBounds({ x: 0, y: 110, width: size[0], height: size[1] - 110 });
		}
	}

	newTab(url=`file:///${__dirname}/views/index.html`) {
		let id = Date.now()
		logger(`New tab, id: ${id}`)
		let newTab = new BrowserView({
			webPreferences: {
				contextIsolation: true,
				nodeIntegration: false
			}
		});
		let size = this.mainWindow.getSize();
		newTab.setBounds({ x: 0, y: 100, width: size[0], height: size[1]});
		newTab.webContents.loadURL(url)

		function updateData(dts) {
			if (dts[id] == null) dts[id] = {}
			dts[id].title = newTab.title;
			dts[id].favicons = newTab.favicons;
			return dts
		}

		// fullscreen fix
		newTab.webContents.on('enter-html-full-screen', (event) => {
			this.mainWindow.removeBrowserView(this.etabsView);
			
			let size = this.mainWindow.getSize();
			this.tabs[this.activeTab].setBounds({ x: 0, y: 0, width: size[0], height: size[1] });
		})
		
		newTab.webContents.on('leave-html-full-screen', (event) => {
			this.mainWindow.addBrowserView(this.etabsView);
			this.updateSizes();
		})
		
		newTab.webContents.on('page-title-updated', (event, title, explicitSet) => {
			logger(`Tab ${id} changed title to ${title}`)
			newTab.title = title
			this.mainWindow.setTitle(title + " | Felida Browser")
			this.dataToSend = updateData(this.dataToSend)
		})

		newTab.webContents.on("render-process-gone", (event, code, desc) => {
			// this usually can load without getting an error
			// so uhm...
			const loadView = (error) => {
				return (`
				<!DOCTYPE html>
				<html>
				<head>
					<style>
						body {
							background-color: rgb(36, 36, 36);
							margin: 0;
							font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
							font-size: 20px;
							color: white;
							text-align: center;
							padding: 0px;
							margin: 0px;
						}
						.err {
							font-family: monospace;
							font-size: 16px;
							color: rgb(158, 158, 158);
						}
					</style>
				</head>
				<body>
					<h1>@.@</h1>
					<p>Ouch! Looks like the page did an oppsie</p>
					<p>Maybe try again later?</p>
					<h3 class="err">${error}</h3>
				</body>
				</html>
				`)
			}
			const file = 'data:text/html;charset=UTF-8,' + encodeURIComponent(loadView(`${code}: ${desc}`));
			newTab.webContents.loadURL(file)
		})

		newTab.webContents.on('page-favicon-updated', (event, favicons) => {
			logger(`Tab ${id} changed favicons to ${favicons}`)
			newTab.favicons = favicons
			newTab.ID = null
			this.dataToSend = updateData(this.dataToSend)
		})
		
        /* this thing crashed
		newTab.webContents.setWindowOpenHandler((el) => {
			switch(el.disposition) {
				case 'save-to-disk':
					// this goes to Downloads related
					break
				default:
					ipcRenderer.send("triggerNewTab", el.url)
				    break
			}
		})
		*/


		this.tabs[id] = newTab
		this.updateSizes();
		/*
		  For some reasons, this context menu didn't work
		  since it tries to call <object>.isDestroyed() which doesn't exist
		contextMenu({
			window: newTab,
			showCopyImage: true,
			showCopyImageAddress: true,
			showSaveImageAs: true,
			showSearchWithGoogle: true
		})();
		*/

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
		// disabled for a while
		//logger(`Blocked Ad, tab ID: ${request.tabId}, Ad URL: ${request.url}`);
	});

	Browser = new FelidaBrowser();
	Browser.preload();
	Browser.run();
});
logger('Libs loaded; Waiting for app to be ready')
