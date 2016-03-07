'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

jest.dontMock('../pagination-reducer');
jest.dontMock('../middleware');

var _require = require('../middleware');

var LAGER_REQUEST = _require.LAGER_REQUEST;
var LAGER_FAILURE = _require.LAGER_FAILURE;
var LAGER_SUCCESS = _require.LAGER_SUCCESS;
var LAGER_ACTION = _require.LAGER_ACTION;

var pagination = require('../pagination-reducer').default;
var removePageParam = require('../pagination-reducer').removePageParam;

describe('removePageParam', function () {
  it('should remove page query param', function () {
    expect(removePageParam('me/resource?page=1')).toEqual('me/resource');
  });
});

describe('ResultReducer', function () {
  var state = {};
  var successWith = function successWith(data) {
    return _extends(_defineProperty({}, LAGER_ACTION, LAGER_SUCCESS), data);
  };
  var requestWith = function requestWith(data) {
    return _extends(_defineProperty({}, LAGER_ACTION, LAGER_REQUEST), data);
  };
  var errorWith = function errorWith(data) {
    return _extends(_defineProperty({}, LAGER_ACTION, LAGER_FAILURE), data);
  };
  var identifier = 'resource/1';
  it('should be loading on request', function () {
    var oneEntityAction = requestWith({
      endpoint: identifier + '?page=1',
      identifier: identifier + '?page=1'
    });
    state = pagination(state, oneEntityAction);
    expect(state[identifier].loading).toEqual(true);
    expect(state[identifier].pages[0].loading).toEqual(true);
  });
  it('should be failed on failed request', function () {
    var oneEntityAction = errorWith({
      endpoint: identifier + '?page=1',
      identifier: identifier + '?page=1'
    });
    state = pagination(state, oneEntityAction);
    expect(state[identifier].loading).toEqual(false);
    expect(state[identifier].error).toEqual(true);
    expect(state[identifier].pages[0].loading).toEqual(false);
  });
  it('should succeed on succes request', function () {
    var oneEntityAction = successWith({
      endpoint: identifier + '?page=1',
      identifier: identifier + '?page=1',
      response: {
        result: {
          users: [{ id: 4, kalle: 2 }, { id: 3, kalle: 2 }, { id: 2, kalle: 2 }],
          perPage: 3,
          totalEntries: 10,
          currentPage: 1
        }
      },
      schemaKeys: ['users']
    });
    state = pagination(state, oneEntityAction);
    expect(state[identifier].loading).toEqual(false);
    expect(state[identifier].pages[0].loading).toEqual(false);
    expect(state[identifier].error).toEqual(false);
    expect(state[identifier].pages[0].users.length).toEqual(3);
  });
  it('should be loading on second page request', function () {
    var oneEntityAction = requestWith({
      endpoint: identifier + '?page=2',
      identifier: identifier + '?page=2'
    });
    state = pagination(state, oneEntityAction);
    expect(state[identifier].pages[1].loading).toEqual(true);
  });
  it('should succeed on second page succes request', function () {
    var oneEntityAction = successWith({
      endpoint: identifier + '?page=2',
      identifier: identifier + '?page=2',
      response: {
        result: {
          users: [{ id: 14, kalle: 2 }, { id: 13, kalle: 2 }, { id: 12, kalle: 2 }],
          perPage: 3,
          totalEntries: 10,
          currentPage: 2
        }
      },
      schemaKeys: ['users']
    });
    state = pagination(state, oneEntityAction);
    expect(state[identifier].loading).toEqual(false);
    expect(state[identifier].error).toEqual(false);
    expect(state[identifier].pages[1].loading).toEqual(false);
    expect(state[identifier].pages[1].users.length).toEqual(3);
  });
});