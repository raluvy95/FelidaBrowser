const {BrowserWindow, NativeImage, session} = require("electron")
const contextMenu = require('electron-context-menu');
const prompt = require("electron-prompt")
const settings = require("./../settings.json")
// require("smalltalk/native")
const { ElectronBlocker } = require('@cliqz/adblocker-electron')
const fetch = require('cross-fetch')// required 'fetch'
contextMenu({
    prepend: (defaultActions, params, browserWindow) => [
        {
            label: 'Search Google for “{selection}”',
            // Only show it when right-clicking text
            visible: params.selectionText.trim().length > 0,
            click: () => {
                shell.openExternal(`https://google.com/search?q=${encodeURIComponent(params.selectionText)}`);
            }
        }
    ],
	showSaveImageAs: true,
	showCopyImageAddress: true,
	
});
const page = require("./about.js")
const createWindow = async () => {
    let win = new BrowserWindow({
        webPreferences: {
            contextIsolation: true,
            enableRemoteModule: false,
            preload: "preload.js"
        },
        title: "Felida Browser",
       // icon: "icon.png",
        show: false,
        backgroundColor: settings.darkmode ? "#242424" : "#FFF" 
    })
    const m = require("../menu.js")
    m(win)
    win.once("ready-to-show", () => {
        win.show()
        win.focus()
    })
    win.maximize()
    win.loadURL('file://' + __dirname + '/../views/index.html')
	let blocker
	if(settings.adblock.enable) {
		blocker = await ElectronBlocker.fromPrebuiltAdsAndTracking(fetch)
    }
    win.on('app-command', (e, cmd, query) => {
        if (cmd === 'browser-backward' && win.webContents.canGoBack()) {
            win.webContents.goBack()
        } else if (cmd === 'browser-forward' && win.webContents.canGoForward()) {
            win.webContents.goForward()
        } 
        switch (cmd) {
            case 'search':
			    win.emit('sendPrompt')
                break;
            case 'console':
                console.log(query)
                break;
			case 'about':
                page()
				break;
        }
    })
    win.webContents.on('did-finish-load', async () => {
	    const url = win.webContents.getURL()
        const title = win.webContents.getTitle()
		if(settings.adblock.ignoreWeb.find(m => m.includes(url))) {
                blocker.disableBlockingInSession(session.defaultSession)
        } else {
                blocker.enableBlockingInSession(session.defaultSession);
        }
        if(url.startsWith("file:///")) {
			win.setTitle("Felida Browser")
		} else {
            win.setTitle(title + " | " + url);
        }	
    })
	win.on('sendPrompt', () => {
		prompt({
           title: 'Search',
           label: 'URL or query',
           type: 'input',
		   value: "https://example.org"
        })
        .then((r) => {
            if(r === null) {
                console.log('user cancelled');
            } else {
                if(!r.startsWith("https://") || !r.startsWith("http://")) {
					win.loadURL(`https://google.com/search?q=${r}`)
				} else {
					win.loadURL(r)
				}
            }
        })
        .catch(console.error);
	})
	win.on('settings', () => {
		const s = require("./settings.js")
		s()
	})
	win.on("finding", () => {
		const find = require("./find.js")
		find()
	})
    win.webContents.on("did-fail-load",() => {
    })
    win.webContents.on("did-start-loading", () => {
        const url = win.webContents.getURL()
        const title = win.webContents.getTitle()
        win.setTitle("Loading... " + title + " | " + url)
    })
    win.webContents.on("did-stop-loading", () => {
        const url = win.webContents.getURL()
        const title = win.webContents.getTitle()
        win.setTitle(title + " | " + url)
    })
}

module.exports = createWindow