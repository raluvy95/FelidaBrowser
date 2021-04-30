console.log('Loading libraries...')
const { BrowserWindow, BrowserView, app, ipcMain } = require('electron')

/*
this.tabs is array of BrowserView objects
*/

class FelidaBrowser
{
	preload()
	{
		console.log('Preloading browser...')
		
		app.on('window-all-closed', () => { app.quit() });
		
		this.activeTab = -1
		this.tabs = []
		
		this.mainWindow = new BrowserWindow({
			width: 800,
			height: 600,
			webPreferences: {
				contextIsolation: false,
				nodeIntegration: true
			}
		});
		
		// Tabs
		this.etabsView = new BrowserView({
			webPreferences: {
				contextIsolation: false,
				nodeIntegration: true
			}
		});
		this.etabsView.webContents.loadFile('views/tabs.html');
		this.mainWindow.addBrowserView(this.etabsView);
		this.etabsView.webContents.openDevTools()
		
		this.mainWindow.on('resize', () => { this.updateSizes(); });
		ipcMain.on('newTab', (event) => {
			console.log(`adding tab`)
			this.updateSizes();
			event.returnValue = this.newTab();
		})
		
		ipcMain.on('getURL', (event, id) => {
			event.returnValue = this.tabs[id].webContents.getURL()
		})
		
		ipcMain.on('goURL', (event, url) => {
			console.log(`changing card ${this.activeTab} to ${url}`)
			console.log(this.tabs, this.activeTab, url)
			if(!(url.startsWith('http://') || url.startsWith('https://') || url.startsWith('file://')))
				url = 'http://' + url
			this.tabs[this.activeTab].webContents.loadURL(url)
			this.updateSizes();
		})
		
		ipcMain.on('setSelectedTab', (event, id) => {
			if(this.activeTab > -1)
			{
				this.mainWindow.removeBrowserView(this.tabs[this.activeTab])
			}
			this.activeTab = id;
			this.mainWindow.addBrowserView(this.tabs[this.activeTab])
			this.updateSizes();
			event.reply('setSelectedTab', id)
			
		})
		
		this.updateSizes();
	}
	
	updateSizes()
	{
		let size = this.mainWindow.getSize();
		this.etabsView.setBounds({ x: 0, y: 0, width: size[0], height: 500 });
		if(this.activeTab > -1)
		{
			this.tabs[this.activeTab].setBounds({ x: 0, y: 100, width: size[0], height: size[1]-120 });
		}
	}
	
	newTab()
	{
		let id = this.tabs.length
		let newTab = new BrowserView({
			webPreferences: {
				contextIsolation: true,
				nodeIntegration: false
			}
		});
		let size = this.mainWindow.getSize();
		newTab.setBounds({ x: 0, y: 100, width: size[0], height: size[1]-100 });
		newTab.webContents.loadFile('views/index.html')
		
		this.tabs.push(newTab)
		this.updateSizes();
		
		return(id);
	}
	
	run()
	{
		console.log('App started')
	}
}

app.on('ready', () =>
{
	console.log('App ready; Creating instance')
	Browser = new FelidaBrowser();
	Browser.preload();
	Browser.run();
});
console.log('Libs loaded; Waiting for app to be ready')
