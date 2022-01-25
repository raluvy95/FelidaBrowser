const { ipcRenderer } = require("electron")

window.addEventListener('DOMContentLoaded', () => {
    const d = ipcRenderer.sendSync("getListBookmarks")
    if (d.length < 1) {
        document.getElementById("list-bookmarks").innerHTML = "<p>There's no bookmarks yet</p>"
    } else {
        for (const elements of d) {
            let img = ''
            if (elements.img) {
                img = `<img src="${elements.img}" />`
            }
            document.getElementById("list-bookmarks").innerHTML += `<li>${img}${elements.title} - ${elements.url}</a><button id="removeBookmark">Remove</button></li>`
        }
    }
    document.getElementById('remove-all').addEventListener('click', () => {
        document.getElementById('confirm').innerHTML = "Do you really want to remove all bookmarks?<br><button id='removeAllConfirm'>Yes</button><button id='removeAllDeny'>No</button>"
        document.getElementById('removeAllConfirm').addEventListener('click', () => {
            ipcRenderer.sendSync("setListBookmarks", 'purge')
            document.getElementById('confirm').innerHTML = 'Removed!'
            setTimeout(() => { document.getElementById('confirm').innerHTML = '' }, 2000)
        })
        document.getElementById('removeAllDeny').addEventListener('click', () => {
            document.getElementById('confirm').innerHTML = ''
        })
    })
})