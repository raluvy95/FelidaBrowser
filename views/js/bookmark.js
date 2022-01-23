const { ipcRenderer } = require("electron")

ipcRenderer.send("getListBookmarks")
ipcRenderer.on('ListBookmarks', (event, d) => {
    if(d.length < 1) {
        document.getElementById("list-bookmarks").innerHTML = "<p>There's no bookmarks yet</p>"
    } else {
        for(const elements of d) {
            
        }
    }
})