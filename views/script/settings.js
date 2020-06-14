const settings = require("./../settings.json")
const fs = require("fs")
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
    settings.adblock.enable = false
    fs.writeFileSync(__dirname + "/../../settings.json", settings)
})
if(settings.adblock.enable) {
    document.getElementById("aden").setAttribute("checked", '')
    if(settings.adblock.ignoreWeb.length > 0) {
        document.getElementById("adig").setAttribute("value", settings.adblock.ignoreWeb.join(", "))
    }
}
document.getElementsByTagName("body")[0].addEventListener("unload", () => {
    const modify = document.getElementById("adig").getAttribute("value")
    if(!modify) return
    else {
        settings.adblock.ignoreWeb = modify.split(", ")
        fs.writeFileSync(__dirname + "/../../settings.json", settings)
    }
})

