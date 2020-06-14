const { app, Menu, clipboard } = require("electron");
const newwin = require("./windows/window.js")
function yes(win) {
const isMac = process.platform === "darwin";
const template = [
  {
    label: "File",
    submenu: [
	isMac ? { role: "close" } : { role: "quit" },
    {role: "close"},
    {role: "minimize"},
	{
		label: "New Window",
	    click: () => {
			newwin()
		}
     },
     {
         label: "Copy URL",
         click: () => {
             if(clipboard.has(win.webContents.getURL())) return;
             clipboard.writeText(win.webContents.getURL());
         }
     },
	 {
		 label: "Settings",
		 click: () => {
			 win.emit('settings')
		 }
	 }
	],
  },
  {
    label: "<",
    click: () => {
        win.emit('app-command', "z", "browser-backward")
    }
  },
  {
    label: ">",
    click: () => {
        win.emit('app-command', "z", "browser-forward")
    }
   },
   {
    label: "Search",
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
                win.loadURL("https://google.com")
            }
        },
        {
            label: "YouTube",
            click: () => {
                win.loadURL("https://youtube.com")
            }
        },
        {
            label: "StackOverflow",
            click: () => {
                win.loadURL("https://stackoverflow.com")
            }
        },
		{
			label: "DuckDuckGo",
			click: () => {
				win.loadURL("https://duckduckgo.com")
			}
        },
        {
            label: "From local network",
            click: () => {
                win.emit("localhost")
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
			win.emit('app-command', 'z', 'about')
		}
	   }
	]
   }
];
const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);
}
module.exports = yes