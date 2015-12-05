var electron = window.require('electron');
var remote = electron.remote;
var ipc = remote.ipcRenderer;
var BrowserWindow = remote.BrowserWindow;

var React = require('react');
var apiRequests = require('../utils/api-requests');

var Actions = require('../actions/actions');

var Login = React.createClass({
  contextTypes: {
    router: React.PropTypes.func
  },

  authGithub: function () {
    var self = this;

    // Start Login
    var options = {
      client_id: '3fef4433a29c6ad8f22c',
      client_secret: '9670de733096c15322183ff17ed0fc8704050379',
      scope: ['user:email', 'notifications']
    };

    //Build the OAuth consent page URL
    var authWindow = new BrowserWindow({
      width: 800,
      height: 600,
      show: true,
      'web-preferences': {
        'node-integration': false
      }
    });
    var githubUrl = 'https://github.com/login/oauth/authorize?';
    var authUrl = githubUrl + 'client_id=' + options.client_id + '&scope=' + options.scope;
    authWindow.loadUrl(authUrl);

    authWindow.webContents.on('will-navigate', function (event, url) {
      handleCallback(url);
    });

    authWindow.webContents.on('did-get-redirect-request', function (event, oldUrl, newUrl) {
      handleCallback(newUrl);
    });

    function handleCallback (url) {
      var raw_code = /code=([^&]*)/.exec(url) || null;
      var code = (raw_code && raw_code.length > 1) ? raw_code[1] : null;
      var error = /\?error=(.+)$/.exec(url);

      if (code || error) {
        // Close the browser if code found or error
        authWindow.destroy();
      }

      // If there is a code, proceed to get token from github
      if (code) {
        self.requestGithubToken(options, code);
      } else if (error) {
        alert('Oops! Something went wrong and we couldn\'t' +
          'log you in using Github. Please try again.');
      }
    }

    // If "Done" button is pressed, hide "Loading"
    authWindow.on('close', function () {
      authWindow.destroy();
    });

  },

  requestGithubToken: function (options, code) {
    var self = this;

    apiRequests
      .post('https://github.com/login/oauth/access_token', {
        client_id: options.client_id,
        client_secret: options.client_secret,
        code: code
      })
      .end(function (err, response) {
        if (response && response.ok) {
          // Success - Do Something.
          Actions.login(response.body.access_token);
          self.context.router.transitionTo('notifications');
          ipc.sendChannel('reopen-window');
        } else {
          // Error - Show messages.
          // Show appropriate message
        }
      });
  },

  render: function () {
    return (
      <div className="container-fluid main-container login">
        <div className='row'>
          <div className='col-xs-offset-2 col-xs-8'>
            <img className='img-responsive logo' src='images/github-logo.png' />
            <div className='desc'>GitHub notifications in your menu bar.</div>
            <button className='btn btn-default btn-lg btn-block' onClick={this.authGithub}>
              <i className="fa fa-github" />Log in to GitHub
            </button>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = Login;
