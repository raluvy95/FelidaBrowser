import { app, BrowserView, BrowserWindow } from "electron";
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
            contextIsolation: false
        }
    })

    ui.webContents.loadFile(__dirname + "/../public/ui.html");

    win.addBrowserView(ui)

    ui.setBounds({
        x: 20, y: 0, height: 200, width: 400
    })

    win.loadFile(__dirname + "/../public/index.html")

    win.show()
})

