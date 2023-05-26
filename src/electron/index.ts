import { app, BrowserView, BrowserWindow, ipcMain } from "electron";
// import { program } from "commander"
import dev, { log } from "./logger";

log("Developement mode ON")

app.whenReady().then(() => {
    log("Initializing...")
    const win = new BrowserWindow({
        title: "sex",
        height: 600,
        width: 800,
        webPreferences: {
            contextIsolation: true
        }
    })

    const ui = new BrowserView({
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true
        }
    })

    ui.webContents.loadFile(__dirname + "/../public/ui.html")

    function updateSize() {
        let size = win.getSize();
        ui.setBounds({ x: 0, y: 0, width: size[0], height: 120 });
    }

    ui.webContents.openDevTools({
        mode: "undocked"
    })

    updateSize()

    win.on("resize", () => {
        updateSize()
    })

    win.on("maximize", () => {
        updateSize()
    })

    win.addBrowserView(ui)

    ipcMain.on('close', () => {
        console.log("ye it works idk")
        win.close()
    })

    win.loadFile(__dirname + "/../public/index.html")

    win.once('ready-to-show', () => {
        win.show()
    })
})

