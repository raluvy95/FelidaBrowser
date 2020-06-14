const {BrowserWindow, NativeImage, session} = require("electron")
const contextMenu = require('electron-context-menu');
const prompt = require("electron-prompt")
const settings = require("./../settings.json")
const n = require('node-notifier')
const path = require("path")
const { ElectronBlocker } = require('@cliqz/adblocker-electron')
const fetch = require('cross-fetch')// required 'fetch'
const prettysize = require("prettysize")
const page = require("./about.js")
const createWindow = async (child) => {
    let win = new BrowserWindow({
        webPreferences: {
            contextIsolation: true,
            enableRemoteModule: false,
            preload: "preload.js",
        },
        title: "Felida Browser",
        icon: __dirname + "/../icon.png",
        show: false,
  //      backgroundColor: settings.darkmode ? "#242424" : "#FFF" 
    })
    const m = require("../menu.js")
    m(win)
    contextMenu({
        prepend: (defaultActions, params, win) => [
            {
                label: 'Search Google for “{selection}”',
                // Only show it when right-clicking text
                visible: params.selectionText.trim().length > 0,
                click: () => {
                    shell.openExternal(`https://google.com/search?q=${encodeURIComponent(params.selectionText)}`);
                }
            },
            {
                label: 'Clear Results',
                visible: true,
                click: () => {
                    win.webContents.stopFindInPage("clearSelection")
                }
            },
            {
                label: "Refresh",
                visible: !win.webContents.isLoading(),
                click: () => {
                    win.webContents.reload()
                }
            },
            {
                label: "Stop",
                visible: win.webContents.isLoading(),
                click: () => {
                    win.webContents.stop()
                }
            }
        ],
        showSaveImageAs: true,
        showCopyImageAddress: true,
        
    });
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
        if(title == "Felida Browser") {
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
           value: "https://example.org",
           icon: __dirname + "/../icon.png"
        })
        .then((r) => {
            if(r === null) {
                return
            } else {
                try {
                    const url = new URL(r)
                    win.loadURL(url.href)
                } catch {
                    win.loadURL(`https://google.com/search?q=${r}`)
                }
            }
        })
        .catch(console.error);
    })
    win.on("localhost", () => {
        prompt({
            title: "Local Network",
            type: 'input',
            label: "Please type port to connect to localhost",
            icon: __dirname + "/../icon.png"
        }).then(r => {
            if(!r) return 
            else {
                win.loadURL(`http://localhost:${r}`)
            }
        })
    })
	win.on('settings', () => {
		const s = require("./settings.js")
		s()
    })
    win.webContents.on('found-in-page', (event, result) => {
    //    win.webContents.stopFindInPage("keepSelection")
        const url = win.webContents.getURL()
        const title = win.webContents.getTitle()
        win.setTitle(`Found ${result.matches} result${result.matches > 1 ? "s" : ''} ` + title + " | " + url)
    })
    function find(query) {
        win.webContents.findInPage(query)
    }
	win.on("finding", () => {
		prompt({
            title: "Find",
            type: "input",
            icon: `${__dirname}/../icon.png`
        }).then(r => {
            if(r == null) return
            else {
                find(r)
            }
        })
	})
    win.webContents.on("did-fail-load",() => {
		win.setTitle("Failed")
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
	win.webContents.session.on("will-download", (event, item, webContents) => {
        const url = win.webContents.getURL()
        const title = win.webContents.getTitle()
        item.on("updated", (event, state) => {
            if(state == "progressing") {
                const current = item.getReceivedBytes()
                const total = item.getTotalBytes()
                win.setTitle(`Downloading an item... ${prettysize(current)}/${prettysize(total)} ${title} | ${url}`)
            }
            if(state == "interrupted") {

            }
        })
		item.once('done', (event, state) => {
            win.setTitle(`${title} | ${url}`)
			if(state == "completed") {
				console.log(event)
				n.notify({
	               title: "Download Completed",
	               message: "You downloaded a item! The name of file is " + item.getFilename(),
	               icon: path.join(__dirname, './../icon.png'),
	               sound: true,
	               wait: false,
	               appID: "Felida Browser"
                }, (err, response) => {
	               console.log(err, response)
                }
                )
			} else {
                n.notify({
                    title: "Download Failed",
                    message: state == "interrupted" ? "The item you downlaoded is interrupted and cannot be resume" : state == "cancelled" ? "The item your downloaded is cancelled": "Unexpected Error.",
                    icon: path.join(__dirname, './../icon.png'),
                    sound: true,
                    wait: false,
                    appID: "Felida Browser"
                }, (err, response) => {
                    console.log(err, response)
                })
            }
		})
	})
}

module.exports = createWindow