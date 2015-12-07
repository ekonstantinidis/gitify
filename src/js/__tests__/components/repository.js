/* global jest, describe, beforeEach, it, expect */

jest.dontMock('reflux');
jest.dontMock('../../actions/actions.js');
jest.dontMock('../../utils/api-requests');
jest.dontMock('../../components/repository.js');
jest.dontMock('../../stores/auth.js');
jest.dontMock('../../stores/notifications.js');

var React = require('react');
var TestUtils = require('react-addons-test-utils');

describe('Test for Repository Component', function () {

  var apiRequests, Actions, Repository;

  beforeEach(function () {

    // Mocks for Electron
    window.require = function () {
      return {
        shell: {
          openExternal: function () {
            // Fake sending message to ipcMain
          }
        },
      }
    };

    // Mock localStorage
    window.localStorage = {
      item: false,
      getItem: function () {
        return this.item;
      },
      setItem: function (item) {
        this.item = item;
      }
    };

    apiRequests = require('../../utils/api-requests.js');
    Actions = require('../../actions/actions.js');
    Repository = require('../../components/repository.js');
  });

  it('Should render the Repository component', function () {

    var repoDetails = [{
      'id': '123',
      'repository': {
        'full_name': 'ekonstantinidis/gitify',
        'owner': {
          'avatar_url': 'http://avatar.url'
        }
      },
      'subject': {
        'type': 'Issue'
      }
    }];

    var instance = TestUtils.renderIntoDocument(
      <Repository
        repo={repoDetails}
        repoName='ekonstantinidis/gitify'
        key='ekonstantinidis/gitify' />
    );

    expect(instance.props.repo[0].repository.full_name).toBe('ekonstantinidis/gitify');
    expect(instance.isRead).toBeFalsy();
    expect(instance.getAvatar).toBeDefined();
    expect(instance.openBrowser).toBeDefined();
    expect(instance.markRepoAsRead).toBeDefined();

    // Get Avatar
    var avatar = instance.getAvatar();
    expect(avatar).toBe('http://avatar.url');

    // Open Browser
    instance.openBrowser();

  });

  it('Should mark a repo as read - successfully', function () {

    var repoDetails = [{
      'id': '123',
      'repository': {
        'name': 'gitify',
        'full_name': 'ekonstantinidis/gitify',
        'owner': {
          'login': 'ekonstantinidis',
          'avatar_url': 'http://avatar.url'
        }
      },
      'subject': {
        'type': 'Issue'
      }
    }];

    var instance = TestUtils.renderIntoDocument(
      <Repository
        repo={repoDetails}
        repoName='ekonstantinidis/gitify'
        key='ekonstantinidis/gitify' />
    );

    expect(instance.state.isRead).toBeFalsy();
    expect(instance.markRepoAsRead).toBeDefined();

    var superagent = require('superagent');
    superagent.__setResponse(200, 'ok', {}, false);

    // Mark Repo as Read
    instance.markRepoAsRead();
    jest.runAllTimers();

    expect(instance.state.isRead).toBeTruthy();

  });

  it('Should mark a repo as read - fail', function () {

    var repoDetails = [{
      'id': '123',
      'repository': {
        'name': 'gitify',
        'full_name': 'ekonstantinidis/gitify',
        'owner': {
          'login': 'ekonstantinidis',
          'avatar_url': 'http://avatar.url'
        }
      },
      'subject': {
        'type': 'Issue'
      }
    }];

    var instance = TestUtils.renderIntoDocument(
      <Repository
        repo={repoDetails}
        repoName='ekonstantinidis/gitify'
        key='ekonstantinidis/gitify' />
    );

    expect(instance.state.isRead).toBeFalsy();
    expect(instance.state.errors).toBeFalsy();
    expect(instance.markRepoAsRead).toBeDefined();

    var superagent = require('superagent');
    superagent.__setResponse(400, false);

    // Mark Repo as Read
    instance.markRepoAsRead();
    jest.runAllTimers();

    expect(instance.state.isRead).toBeFalsy();
    expect(instance.state.errors).toBeTruthy();

  });

});
