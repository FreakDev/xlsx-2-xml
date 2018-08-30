const {app, BrowserWindow, ipcMain, dialog } = require('electron')
const transform = require('./transform.js')
const fs = require('fs')

let mainWindow

function createWindow () {
    mainWindow = new BrowserWindow({
        resizable: false,
        width: 800, 
        height: 600
    })

    mainWindow.loadFile('html/index.html')

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    mainWindow.on('closed', function () {
        mainWindow = null
    })
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
    app.quit()
})

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow()
    }
})

ipcMain.on('log', function(ev, args) { 
    console.log.apply(console, args)
})

ipcMain.on('convert', function(ev, filePath) {
    console.log(filePath)
    transform(filePath).then(function (xml) {
        dialog.showSaveDialog(mainWindow, { defaultPath: 'virements.xml' }, function (fileToSave) {
            if (fileToSave !== undefined)
                fs.writeFileSync(fileToSave, xml, 'utf8');
        })    
    })
})

