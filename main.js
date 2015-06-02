var app = require('app');
var path = require('path');
var ipc = require('ipc');

require('crash-reporter').start();

var Menu = require('menu');
var Tray = require('tray');
var BrowserWindow = require('browser-window');

var iconIdle = path.join(__dirname, 'images', 'tray-idleTemplate.png');
var iconActive = path.join(__dirname, 'images', 'tray-active.png');

app.on('ready', function(){
  var appIcon = new Tray(iconIdle);
  initWindow();

  appIcon.on('clicked', function clicked (e, bounds) {
    if (appIcon.window && appIcon.window.isVisible()) {
      return hideWindow();
    } else {
      showWindow(bounds);
    }
  });

  function initWindow () {
    var defaults = {
      width: 420,
      height: 370,
      show: false,
      frame: false,
      resizable: false,
      'standard-window': false
    };

    appIcon.window = new BrowserWindow(defaults);
    appIcon.window.loadUrl('file://' + __dirname + '/index.html');
    appIcon.window.on('blur', hideWindow);

    initMenu();
  }

  function showWindow (bounds) {
    var ElectronScreen = require('screen');
    var workAreaSize = ElectronScreen.getPrimaryDisplay().workAreaSize;
    var windowSize = appIcon.window.getBounds();
    var defaultX = workAreaSize.width-windowSize.width;
    var defaultY = 0;
    var options = {
      x: defaultX || bounds.x - 200 + (bounds.width / 2),
      y: defaultY || bounds.y,
      index: path.join('./', 'index.html')
    };

    appIcon.window.setPosition(options.x, options.y);
    appIcon.window.show();
  }

  function initMenu () {
    var template = [{
      label: 'Edit',
      submenu: [
        {
          label: 'Copy',
          accelerator: 'Command+C',
          selector: 'copy:'
        },
        {
          label: 'Paste',
          accelerator: 'Command+V',
          selector: 'paste:'
        }
      ]
    }];

    var menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }

  function hideWindow () {
    if (!appIcon.window) { return; }
    appIcon.window.hide();
  }

  ipc.on('reopen-window', function() {
    appIcon.window.show();
  });

  ipc.on('update-icon', function(event, arg) {
    if (arg === "TrayActive") {
      appIcon.setImage(iconActive);
    } else {
      appIcon.setImage(iconIdle);
    }
  });

  ipc.on('app-quit', function() {
    app.quit();
  });

  if(process.platform === 'darwin'){
    app.dock.hide();
  }
  appIcon.setToolTip('GitHub Notifications on your menu bar.');
});
