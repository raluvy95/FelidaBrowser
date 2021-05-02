const { app, Menu, clipboard } = require("electron");
function menu(win) {
	const isMac = process.platform === "darwin";
	const template = [
		{
			label: "File",
			submenu: [
				isMac ? { role: "close" } : { role: "quit" },
				{
					label: "Settings",
					click: () => {
						win.emit('settings')
					}
				}
			],
		},
		{
			label: "Search (NOT FINISHED)",
			submenu: [
				{
					label: "Search an URL or via Google",
					click: () => {
						win.emit('sendPrompt')
					}
				},
				{
					label: "Find in page",
					click: () => {
						win.emit("finding")
					}
				}
			]
		},
		{
			label: "Website",
			submenu: [
				{
					label: "Google",
					click: () => {
						win.emit('goURL', "https://google.com")
					}
				},
				{
					label: "YouTube",
					click: () => {
						win.emit('goURL', "https://youtube.com")
					}
				},
				{
					label: "StackOverflow",
					click: () => {
						win.emit('goURL', "https://stackoverflow.com")
					}
				},
				{
					label: "DuckDuckGo",
					click: () => {
						win.emit('goURL', "https://duckduckgo.com")
					}
				},
				{
					label: "From local network",
					click: () => {
						win.emit('goURL', "https://localhost")
					}
				}
			]
		},
		{
			label: "Help",
			submenu: [
				{
					label: "About",
					click: () => {
						win.emit('about')
					}
				}
			]
		}
	];
	const menut = Menu.buildFromTemplate(template);
	Menu.setApplicationMenu(menut);
}
module.exports = menu
