const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const url = require('url');

let win;

function createWindow(){
  win = new BrowserWindow({
    width:800,
    height:600,
    // icon: path.join(__dirname,"favicon.png"),
    autoHideMenuBar: true,
    resizable: false,
    maxWidth:800,
    minHeight:600,
    minWidth:800,
    fullscreen: false,
    fullscreenable: false,
    nativeWindowOpen: true
  })
  win.loadURL(url.format({
    pathname: path.join(__dirname,'index.html'),
    protocol : 'file',
    slashes: true
  }))

  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  Menu.setApplicationMenu(mainMenu); // Uncomment this line to disable and  modify the Menu

  win.on('closed',()=>{
    win = null
  })
}

app.on('ready',createWindow)
app.on('window-all-closed',()=>{
  if (process.platform !== 'darwin') {
    app.quit()
  }
})


const mainMenuTemplate = [
  {
    label : "File",
    submenu : [
      {
        label : "Restart",
        accelerator: "Ctrl+R",
        click(){
          win.reload()
        }
      },
      {
        label : "Exit",
        accelerator: "Ctrl+Q",
        click(){
          app.quit()
        }
      }
    ]
  }
]
