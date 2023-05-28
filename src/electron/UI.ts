import { BrowserView, BrowserWindow, ipcMain } from "electron";
import { log } from "./logger";
import path from "path";

export class FelidaUI extends BrowserView {
    private parent: BrowserWindow;
    constructor(parent: BrowserWindow) {
        super({
            webPreferences: {
                contextIsolation: false,
                nodeIntegration: true
            }
        });

        this.parent = parent;

        const URL = `file://${path.join(__dirname, "../public/ui.html")}`;

        //this.webContents.loadURL(URL);
        this.webContents.loadFile(path.join(__dirname, "../public/ui.html"));
        setTimeout(this.updateSize, 2); // try now doesn't work

        log(URL);

        this.parent.on("resize", () => {
            console.log("resize");
            this.updateSize();
        });

        this.webContents.openDevTools({
            mode: "undocked"
        });

        this.parent.on("maximize", () => {
            // without timeout it would do nothing
            console.log("maximize");
            setTimeout(this.updateSize, 2);
        });

        ipcMain.on("close", () => {
            console.log("ye it works idk");
            this.parent.close();
        });

        this.webContents.on("did-finish-load", () => {
            this.setAutoResize({
                vertical: true,
                horizontal: true
            });
            setTimeout(this.updateSize, 2);
        });
    }
    private updateSize = () => {
        const b = this.parent.getBounds();
        this.setBounds({ x: 0, y: 0, width: b.width, height: b.height - 100 });
    };
}