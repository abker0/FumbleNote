const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const { text } = require("stream/consumers");
const { error } = require("console");
const wordCount = require('word-count');
let wordc

let mainWindow;
let activefilepath;

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        minWidth: 400,
        minHeight: 400,
        frame: false,
        titleBarStyle: "hiddenInset",
        icon: "assets/icons/AppIcon.icns",
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            preload: path.join(app.getAppPath(), "renderer.js")
        }
    });

    const error_handler = () => {
        new Notification({
            title:"Error",
            body:"Sorry something went wrong"
        })

    }

    mainWindow.loadFile("index.html");

};

app.whenReady().then(createWindow);

ipcMain.on("create-document-triggered", () => {
    dialog.showSaveDialog(mainWindow, {
        filters: [{ name: "Text Files", extensions: ["txt"] }]
    }).then(({ filePath }) => {
        if (filePath) {
            fs.writeFile(filePath, "", (error) => {
                if (error) {
                    error_handler()
                } else {
                    activefilepath = filePath
                    mainWindow.webContents.send("document-created", filePath);
                    mainWindow.webContents.send('wordcountsignal', `0 words`);
                }
            });
        } else {
            console.log("Save dialog was cancelled.");
        }
    }).catch(err => {
        error_handler()
    });
});

ipcMain.on("open-document-triggered", () => {
    dialog.showOpenDialog({
        properties: ["openFile"],
        filters: [{ name: "Text Files"}]
    }).then(({ filePaths }) => {
        if (filePaths && filePaths.length > 0) {
            const filePath = filePaths[0];
            fs.readFile(filePath, "utf8", (error, content) => {
                if (error) {
                    error_handler()
                } else {
                    activefilepath = filePath
                    mainWindow.webContents.send("document-opened", { filePath, content });
                    wordc = wordCount(content)
                    mainWindow.webContents.send('wordcountsignal', `${wordc} words`);
                }
            });
        } else {
            console.log("No file selected.");
        }
    }).catch(err => {
        error_handler()
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.whenReady().then(() => {
    mainWindow.webContents.on('before-input-event', (event, input) => {
        if ((input.control || input.meta) && input.key.toLowerCase() === 'r') {
            event.preventDefault();
        }
        if (input.key === 'F5') {
            event.preventDefault();
        }
    });
});

ipcMain.on("file-updated", (_, textareacontent) => {
    const wordc = wordCount(textareacontent);
    fs.writeFile(activefilepath, textareacontent, (error) => {
        if (error) {
            error_handler();
        } else {
            mainWindow.webContents.send('wordcountsignal', `${wordc} words`);
        }
    });
});

ipcMain.on("file-updated-bysave", (_, textareacontent) => {
    fs.writeFile(activefilepath, textareacontent, (error) => {
        if (error) {
            error_handler()
            mainWindow.webContents.send("saveresult", "File failed to save ");
        }else{
            mainWindow.webContents.send("saveresult", "File saved");
        }
    })

})
