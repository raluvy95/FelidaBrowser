import { BrowserView, BrowserWindow } from "electron";
import { platform } from "os";
import { FelidaTab } from "./Tab";
import { log } from "./logger";
import { FelidaUI } from "./UI";

export class FelidaBrowser extends BrowserWindow {
    public ui: BrowserView;
    public tabs: { id: number, tab: FelidaTab }[];

    public constructor() {
        super({
            title: "Felida Browser",
            height: 600,
            width: 800,
            webPreferences: {
                contextIsolation: true
            },
            icon: platform() == "win32" ? __dirname + "/../resources/icon.ico" : __dirname + "/../resources/icon.png"
        });

        this.tabs = [];

        log(__dirname);
        this.ui = new FelidaUI(this);

        this.addBrowserView(this.ui);

        this.newTab();
    }

    public newTab = (url = `file://${__dirname}/../public/index.html`) => {
        const tab = new FelidaTab(url, this);
        this.tabs.push({ id: tab.id, tab });
        this.addBrowserView(tab);

        tab.webContents.on("did-fail-load", () => {
            log("failed to load");
        });
    };
}