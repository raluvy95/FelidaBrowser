import { BrowserView, BrowserWindow, ipcMain } from "electron";

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

        this.webContents.loadURL(`file://${__dirname}/../public/ui.html`);

        this.parent.on("resize", () => {
            this.updateSize();
        });

        this.webContents.openDevTools({
            mode: "undocked"
        });

        this.parent.on("maximize", () => {
            // without timeout it would do nothing
            setTimeout(() => {
                this.updateSize();
            }, 300);
        });

        ipcMain.on("close", () => {
            console.log("ye it works idk");
            this.parent.close();
        });
    }
    private updateSize = () => {
        const size = this.parent.getSize();
        this.setBounds({ x: 0, y: 0, width: size[0], height: 90 });
    };
}