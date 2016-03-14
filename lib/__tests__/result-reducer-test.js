'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

jest.dontMock('../result-reducer');
jest.dontMock('../middleware');

var _require = require('../middleware');

var LAGER_RESET = _require.LAGER_RESET;
var LAGER_REQUEST = _require.LAGER_REQUEST;
var LAGER_FAILURE = _require.LAGER_FAILURE;
var LAGER_SUCCESS = _require.LAGER_SUCCESS;
var LAGER_ACTION = _require.LAGER_ACTION;

var result = require('../result-reducer').default;

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
  var reset = function reset(identifier) {
    var _ref;

    return _ref = {}, _defineProperty(_ref, LAGER_ACTION, LAGER_RESET), _defineProperty(_ref, 'identifier', identifier), _ref;
  };
  var identifier = 'resource/1';
  it('should be loading on request', function () {
    var oneEntityAction = requestWith({
      identifier: identifier
    });
    state = result(state, oneEntityAction);
    expect(state[identifier].loading).toEqual(true);
  });
  it('should not be loading after request', function () {
    var oneEntityAction = successWith({
      identifier: identifier,
      response: {
        result: 5
      }
    });
    state = result(state, oneEntityAction);
    expect(state[identifier].loading).toEqual(false);
    expect(state[identifier].result).toEqual(5);
  });
  it('should not be loading after failure', function () {
    var oneEntityAction = errorWith({
      identifier: identifier
    });
    state = result(state, oneEntityAction);
    expect(state[identifier].loading).toEqual(false);
    expect(state[identifier].error).toEqual(true);
  });
  it('should reset it all', function () {
    state = result(state, reset(identifier));
    expect(state[identifier]).toEqual(null);
  });
});