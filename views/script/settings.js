const settings = require("./../settings.json")
const fs = require("fs")
const path = require("path")

/* load */
function load()
{
	document.getElementById("aden").checked = settings.adblock.enable;
	refreshIgnoreWeb();
}

window.addEventListener('load', load())

function refreshIgnoreWeb()
{
    if(settings.adblock.ignoreWeb.length > 0)
        document.getElementById("adig").setAttribute("value", settings.adblock.ignoreWeb.join(", "))
    else
        document.getElementById("adig").setAttribute("value", '')
}

function clear() {
    const {remote} = require("electron")
    const cleaning = remote.getCurrentWebContents().session
    cleaning.clearCache()
    cleaning.clearStorageData()
    cleaning.clearAuthCache()
    cleaning.clearHostResolverCache()
}
document.getElementById("close").addEventListener("click", () => {
    const {remote} = require("electron")
    const win = remote.getCurrentWindow()
    win.close()
})
document.getElementById("aden").addEventListener("click", () => {
    settings.adblock.enable = document.getElementById("aden").checked
    fs.writeFileSync(path.join(__dirname, "/../settings.json"), JSON.stringify(settings))
    refreshIgnoreWeb()
})

document.getElementsByTagName("body")[0].addEventListener("unload", () => {
    const modify = document.getElementById("adig").getAttribute("value")
    if(!modify) return
    else {
        settings.adblock.ignoreWeb = modify.split(", ")
        fs.writeFileSync(path.join(__dirname, "/../settings.json"), JSON.stringify(settings))
    }
})

