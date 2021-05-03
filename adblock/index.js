/// WIP

const fetch = require("node-fetch")

function detector(URL) {
    fetch("https://easylist.to/easylist/easylist.txt").then(res => res.text())
    .then(res => {
        
    })
}