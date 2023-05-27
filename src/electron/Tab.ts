import { BrowserView, BrowserWindow } from "electron";
import { log } from "./logger";

export class FelidaTab extends BrowserView {
    public readonly id: number;
    private parent: BrowserWindow;
    public url: string;
    public constructor(url: string, parent: BrowserWindow) {
        super({
            webPreferences: {
                contextIsolation: true,
                nodeIntegration: false,
            }
        });
        this.id = Date.now();
        this.parent = parent;
        this.url = url;
        this.load();
    }

    private load = () => { // for some reasons, this way works
        this.webContents.loadURL(this.url);

        log(`Tab [${this.id}] is loaded ${this.url}`);

        // this.webContents.openDevTools({
        //     mode: "undocked"
        // })

        this.parent.on("resize", () => {
            this.updateSize();
        });
        this.parent.on("maximize", () => {
            setTimeout(() => {
                this.updateSize();
            }, 300);
        });

        this.updateSize();
    };

    public updateSize = () => {
        const size = this.parent.getSize();
        console.log(size);
        this.setBounds({ x: 0, y: 90, width: size[0], height: size[1] - 80 });
    };
}