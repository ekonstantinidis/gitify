/*global jest, describe, it, expect, spyOn, beforeEach */

'use strict';

jest.dontMock('reflux');
jest.dontMock('../../stores/notifications.js');
jest.dontMock('../../utils/api-requests.js');
jest.dontMock('../../actions/actions.js');

describe('Tests for NotificationsStore', function () {

  var NotificationsStore, Actions, apiRequests;

  beforeEach(function () {

    // Mocks for Electron
    window.require = function () {
      return {
        ipcRenderer: {
          send: function () {
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

    // Mock Audio
    window.Audio = function () {
      return {
        play: function () {}
      };
    };

    // Mock Notifications
    window.Notification = function () {
      return {
        onClick: function () {}
      };
    };

    Actions = require('../../actions/actions.js');
    apiRequests = require('../../utils/api-requests.js');
    NotificationsStore = require('../../stores/notifications.js');
  });

  it('should get the notifications from the GitHub API', function () {

    spyOn(NotificationsStore, 'trigger');

    var response = [{
      'id': '1',
      'repository': {
        'id': 1296269,
        'owner': {
          'login': 'octocat',
          'id': 1,
          'avatar_url': 'https://github.com/images/error/octocat_happy.gif',
          'gravatar_id': '',
          'url': 'https://api.github.com/users/octocat',
          'html_url': 'https://github.com/octocat',
          'followers_url': 'https://api.github.com/users/octocat/followers',
          'following_url': 'https://api.github.com/users/octocat/following{/other_user}',
          'gists_url': 'https://api.github.com/users/octocat/gists{/gist_id}',
          'starred_url': 'https://api.github.com/users/octocat/starred{/owner}{/repo}',
          'subscriptions_url': 'https://api.github.com/users/octocat/subscriptions',
          'organizations_url': 'https://api.github.com/users/octocat/orgs',
          'repos_url': 'https://api.github.com/users/octocat/repos',
          'events_url': 'https://api.github.com/users/octocat/events{/privacy}',
          'received_events_url': 'https://api.github.com/users/octocat/received_events',
          'type': 'User',
          'site_admin': false
        },
        'name': 'Hello-World',
        'full_name': 'octocat/Hello-World',
        'description': 'This your first repo!',
        'private': false,
        'fork': false,
        'url': 'https://api.github.com/repos/octocat/Hello-World',
        'html_url': 'https://github.com/octocat/Hello-World'
      },
      'subject': {
        'title': 'Greetings',
        'url': 'https://api.github.com/repos/octokit/octokit.rb/issues/123',
        'latest_comment_url': 'https://api.github.com/repos/octokit/octokit.rb/issues/comments/123',
        'type': 'Issue'
      },
      'reason': 'subscribed',
      'unread': true,
      'updated_at': '2014-11-07T22:01:45Z',
      'last_read_at': '2014-11-07T22:01:45Z',
      'url': 'https://api.github.com/notifications/threads/1'
    }];

    var superagent = require('superagent');
    superagent.__setResponse(200, 'ok', response, false);

    Actions.getNotifications();

    jest.runAllTimers();

    var repository = NotificationsStore._notifications[0].repository;
    var subjectTitle = NotificationsStore._notifications[0].subject.title;
    expect(repository.full_name).toBe('octocat/Hello-World');
    expect(subjectTitle).toBe('Greetings');
    expect(NotificationsStore.trigger).toHaveBeenCalled();

  });

  it('should get 0(zero) notifications from the GitHub API', function () {

    spyOn(NotificationsStore, 'trigger');

    var response = [];

    var superagent = require('superagent');
    superagent.__setResponse(200, 'ok', response, false);

    Actions.getNotifications();

    jest.runAllTimers();

    expect(NotificationsStore._notifications.length).toBe(0);
    expect(NotificationsStore.trigger).toHaveBeenCalled();

  });

  it('should FAIL to get the notifications from the GitHub API', function () {

    spyOn(NotificationsStore, 'trigger');
    spyOn(NotificationsStore, 'onGetNotificationsFailed');

    var superagent = require('superagent');
    superagent.__setResponse(400, false);

    Actions.getNotifications();

    jest.runAllTimers();

    expect(NotificationsStore.trigger).toHaveBeenCalled();

  });

  it('should mark a notification as read - remove single notification from store', function () {

    spyOn(NotificationsStore, 'trigger');

    NotificationsStore._notifications = ['abc', 'def'];

    expect(NotificationsStore._notifications.length).toBe(2);

    Actions.removeNotification('abc');

    jest.runAllTimers();

    expect(NotificationsStore._notifications.length).toBe(1);
    expect(NotificationsStore.trigger).toHaveBeenCalled();

  });

  it('should mark a repo as read - remove notifications from store', function () {

    spyOn(NotificationsStore, 'trigger');

    NotificationsStore._notifications = [
      {
        'id': '1',
        'repository': {
          'full_name': 'ekonstantinidis/gitify'
        },
        'unread': true
      },
      {
        'id': '2',
        'repository': {
          'full_name': 'ekonstantinidis/gitify'
        },
        'reason': 'subscribed'
      }
    ];

    expect(NotificationsStore._notifications.length).toBe(2);

    Actions.removeRepoNotifications('ekonstantinidis/gitify');

    jest.runAllTimers();

    expect(NotificationsStore._notifications.length).toBe(0);
    expect(NotificationsStore.trigger).toHaveBeenCalled();

  });

});
