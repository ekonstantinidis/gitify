import reducer from '../../reducers/settings';
import { UPDATE_SETTING, HAS_STARRED } from '../../actions';

describe('reducers/settings.js', () => {
  const initialState = {
    participating: false,
    playSound: true,
    showNotifications: true,
    markOnClick: false,
    openAtStartup: false,
    hasStarred: false
  };

  it('should return the initial state', () => {

    expect(reducer(undefined, {})).to.eql(initialState);

  });

  it('should handle UPDATE_SETTING', () => {

    const actionParticipating = {
      type: UPDATE_SETTING,
      setting: 'participating',
      value: true
    };

    expect(reducer(undefined, actionParticipating)).to.eql({
      ...initialState,
      participating: true
    });

    const actionOpenAtStartUp = {
      type: UPDATE_SETTING,
      setting: 'openAtStartup',
      value: true
    };

    expect(reducer(undefined, actionOpenAtStartUp)).to.eql({
      ...initialState,
      openAtStartup: true
    });

  });

  it('should handle HAS_STARRED.SUCCESS', () => {

    const actionParticipating = {
      type: HAS_STARRED.SUCCESS
    };

    expect(reducer(undefined, actionParticipating)).to.eql({
      ...initialState,
      hasStarred: true
    });

  });

  it('should handle HAS_STARRED.SUCCESS', () => {

    const actionParticipating = {
      type: HAS_STARRED.FAILURE
    };

    expect(reducer(undefined, actionParticipating)).to.eql({
      ...initialState,
      hasStarred: false
    });

  });

});
