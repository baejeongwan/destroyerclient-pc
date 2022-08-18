const { app, BrowserWindow, ipcMain, autoUpdater, dialog } = require('electron');
const path = require('path');
const i18next = require('i18next');
const fs = require('fs');
const log = require('electron-log');
const updater = require('electron-updater');

let win;

const createWindow = () => {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, "preload.js")
        }
    });

    win.loadFile('main.html');
}

app.whenReady().then(() => {
    createWindow();
    autoUpdater.checkForUpdates();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
})

i18next.init({
    lng: "en",
    debug: true,
    resources: JSON.parse(fs.readFileSync('./langpack.json', {encoding: 'utf-8'}))
}, function (err, t) {
    log.info(i18next.t("i18InitOK"))
})

ipcMain.on('requestTranslation', (e, args) => {
    e.sender.send('requestTranslationReply', {
        requested: args,
        translation: i18next.t(args)
    });
})

autoUpdater.on('checking-for-update', () => {
    log.debug("Check update...")
})

autoUpdater.on('update-not-available', () => {
    log.info("No update")
})

autoUpdater.on('error', (err) => {
    dialog.showErrorBox(i18next.t("updaterFailureTitle"), i18next.t("updaterFailureMessage") + err);
})

autoUpdater.on('update-available', () => {
    let dialogBtn = dialog.showMessageBoxSync(win, {type: "question", "buttons": [i18next.t("updaterInstallNow"), i18next.t("cancel")], defaultId: 0, title: i18next.t("updateAvailable"), message: i18next.t("updateAvailable")})
    if (dialogBtn == 0) {
        autoUpdater.quitAndInstall();
    }
})