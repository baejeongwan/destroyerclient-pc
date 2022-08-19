const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const i18next = require('i18next');
const fs = require('fs');
const log = require('electron-log');
const { autoUpdater } = require('electron-updater');
const ProgressBar = require('electron-progressbar');

let win;
let updateProgressBar;

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
    resources: JSON.parse(fs.readFileSync(path.join(__dirname, "langpack.json"), {encoding: 'utf-8'}))
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
    console.log(err);
    dialog.showErrorBox(i18next.t("updaterFailureTitle"), i18next.t("updaterFailureMessage") + err);
})

autoUpdater.on('update-available', () => {
    let dialogBtn = dialog.showMessageBoxSync(win, {type: "question", buttons: [i18next.t("updaterInstallNow"), i18next.t("cancel")], defaultId: 0, title: i18next.t("updateAvailable"), message: i18next.t("updateAvailable")})
    if (dialogBtn == 0) {
        updateProgressBar = new ProgressBar({
            indeterminate: false,
            text: i18next.t("updaterDownloading"),
            detail: i18next.t("pleaseWait")
        })
        autoUpdater.downloadUpdate();
    }
})

autoUpdater.on('download-progress', (prgrs) => {
    updateProgressBar.value = prgrs.percent;
})

autoUpdater.on('update-downloaded', () => {
    let dialogBtn = dialog.showMessageBoxSync(win, {type: "question", buttons: [i18next.t("restart"), i18next.t("later")], defaultId: 0, title: i18next.t("updaterDownloaded"), message: i18next.t("updaterRestartRequired")})
    if (dialogBtn == 0) {
        autoUpdater.quitAndInstall();
    }
})