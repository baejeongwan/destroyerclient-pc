const { ipcRenderer } = require('electron');
window.addEventListener('DOMContentLoaded', () => {
    initLang()
})

function initLang() {
    ipcRenderer.send('requestTranslation', 'appName');
    ipcRenderer.send('requestTranslation', 'accessWebsite');
    ipcRenderer.send('requestTranslation', 'accessChat');
}

ipcRenderer.on('requestTranslationReply', (e, args) => {
    if (args.requested == "appName") {
        document.title = args.translation
        document.getElementById('landingText').innerText = args.translation
    } else if (args.requested == "accessWebsite") {
        document.getElementById('accessWebsite').innerText = args.translation
    } else if (args.requested == "accessChat") {
        document.getElementById('accessChat').innerText = args.translation
    }
})