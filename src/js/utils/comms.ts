const { ipcRenderer, remote, shell } = require('electron');

export function openExternalLink(url) {
  shell.openExternal(url);
}

export function setAutoLaunch(value: boolean) {
  remote.app.setLoginItemSettings({
    openAtLogin: value,
    openAsHidden: value,
  });
}

export function updateTrayIcon(notificationsLength = 0) {
  if (notificationsLength > 0) {
    ipcRenderer.send('update-icon', 'TrayActive');
  } else {
    ipcRenderer.send('update-icon');
  }
}

export function reOpenWindow() {
  ipcRenderer.send('reopen-window');
}

export function restoreSetting(setting, value) {
  ipcRenderer.send(setting, value);
}
