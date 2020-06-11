const { app, Menu, clipboard } = require("electron");

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
	    role: "open"
     },
     {
         label: "Copy URL",
         click: () => {
             if(clipboard.has(win.webContents.getURL())) return;
             clipboard.writeText(win.webContents.getURL());
         }
     }
	],
  },
  {
    label: "Back",
    click: () => {
        win.emit('app-command', "z", "browser-backward")
    }
  },
  {
    label: "Front",
    click: () => {
        win.emit('app-command', "z", "browser-forward")
    }
   },
   {
    label: "Search",
    submenu: [
        { 
            label: "Search an URL adress",
            click: () => {
                win.emit('app-command', 'z', 'search')
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