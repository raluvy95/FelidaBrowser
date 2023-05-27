import { app } from "electron";
// import { program } from "commander"
import { log } from "./logger";
import { FelidaBrowser } from "./Browser";

log("Developement mode ON");

app.whenReady().then(() => {
    log("Initializing...");
    const win = new FelidaBrowser();

    win.on("ready-to-show", () => {
        win.show();
    });
});

