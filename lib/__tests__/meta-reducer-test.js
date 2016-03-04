'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

jest.dontMock('../meta-reducer');
jest.dontMock('../middleware');

var _require = require('../middleware');

var LAGER_SUCCESS = _require.LAGER_SUCCESS;
var LAGER_ACTION = _require.LAGER_ACTION;

var meta = require('../meta-reducer').default;

describe('MetaReducer', function () {
  var state = {};
  var lastUpdate = 0;
  var actionWith = function actionWith(users) {
    var _ref;

    return _ref = {}, _defineProperty(_ref, LAGER_ACTION, LAGER_SUCCESS), _defineProperty(_ref, 'response', {
      entities: {
        users: _extends({}, users)
      }
    }), _ref;
  };
  it('should update updatedAt value', function () {
    var oneEntityAction = actionWith({
      15: {
        name: 'kalle'
      }
    });
    state = meta(state, oneEntityAction);
    lastUpdate = state.users[15].updatedAt;
    expect(lastUpdate).toBeDefined();
  });
  it('should overwrite updatedAt value', function () {
    var oneEntityAction = actionWith({
      15: {
        name: 'kalle'
      }
    });
    state = meta(state, oneEntityAction);
    var newUpdatedAt = state.users[15].updatedAt;
    expect(lastUpdate).toBeLessThan(newUpdatedAt);
  });
  it('should update multiple entities', function () {
    var oneEntityAction = actionWith({
      25: {
        name: 'kalle'
      },
      29: {
        name: 'kalle'
      },
      52: {
        name: 'kalle'
      },
      24: {
        name: 'kalle'
      }
    });
    state = meta(state, oneEntityAction);
    expect(Object.keys(state.users).length).toEqual(5);
  });
});