const {BrowserWindow, NativeImage} = require("electron")
const contextMenu = require('electron-context-menu');
 
contextMenu({
    prepend: (defaultActions, params, browserWindow) => [
        {
            label: 'Rainbow',
            // Only show it when right-clicking images
            visible: params.mediaType === 'image'
        },
        {
            label: 'Search Google for “{selection}”',
            // Only show it when right-clicking text
            visible: params.selectionText.trim().length > 0,
            click: () => {
                shell.openExternal(`https://google.com/search?q=${encodeURIComponent(params.selectionText)}`);
            }
        }
    ]
});
const page = require("./about.js")
const createWindow = () => {
    let win = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            webviewTag: true
        },
        title: "Felida Browser",
        icon: "icon.png",
        show: false,
        backgroundColor: "#242424" 
    })
    const m = require("../menu.js")
    m(win)
    win.once("ready-to-show", () => {
        win.show()
        win.focus()
    })
    win.maximize()
    win.loadURL('file://' + __dirname + '/../views/index.html')
    win.on('app-command', (e, cmd, query) => {
        if (cmd === 'browser-backward' && win.webContents.canGoBack()) {
            win.webContents.goBack()
        } else if (cmd === 'browser-forward' && win.webContents.canGoForward()) {
            win.webContents.goForward()
        } 
        switch (cmd) {
            case 'search':
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
		setInterval(() => {
			const url = win.webContents.getURL()
            const title = win.webContents.getTitle()
            if(url.startsWith("file://")) return
            win.setTitle(title + " | " + url)
		}, 3000)
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