import { BrowserView, BrowserWindow, ipcMain } from "electron";
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

        this.webContents.loadFile(path.join(__dirname, "../public/ui.html"));
        setTimeout(this.updateSize, 2);

        this.parent.on("resize", this.updateSize);

        this.webContents.openDevTools({ mode: "undocked" });

        this.parent.on("maximize", () => {
            setTimeout(this.updateSize, 2);
        });

        ipcMain.on("close", () => { this.parent.close(); });
        ipcMain.on("maximize", () => {
            if (this.parent.isMaximized()) {
                this.parent.restore();
            } else {
                this.parent.maximize();
            }
        });
        ipcMain.on("minimize", () => { this.parent.minimize(); });

        this.webContents.on("did-finish-load", () => {
            setTimeout(this.updateSize, 2);
        });
    }
    private updateSize = () => {
        const b = this.parent.getBounds();
        this.setBounds({ x: 0, y: 0, width: b.width, height: b.height - 100 });
    };
}