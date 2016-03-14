'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ENTITIES_FAILURE = exports.ENTITIES_SUCCESS = exports.ENTITIES_REQUEST = undefined;
exports.fetch = fetch;
exports.reset = reset;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _middleware = require('./middleware');

var _fetchWrap = require('./fetch-wrap');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var ENTITIES_REQUEST = exports.ENTITIES_REQUEST = 'ENTITIES_REQUEST';
var ENTITIES_SUCCESS = exports.ENTITIES_SUCCESS = 'ENTITIES_SUCCESS';
var ENTITIES_FAILURE = exports.ENTITIES_FAILURE = 'ENTITIES_FAILURE';

function fetch(input) {
  var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var identifier = _ref.identifier;
  var schema = _ref.schema;
  var _ref$types = _ref.types;
  var types = _ref$types === undefined ? [ENTITIES_REQUEST, ENTITIES_SUCCESS, ENTITIES_FAILURE] : _ref$types;

  var init = _objectWithoutProperties(_ref, ['identifier', 'schema', 'types']);

  return _defineProperty({}, _middleware.LAGER_FETCH, {
    input: input,
    init: init,
    identifier: identifier,
    schema: schema,
    types: types
  });
}

function reset(identifier) {
  var _ref3;

  return _ref3 = {}, _defineProperty(_ref3, _middleware.LAGER_ACTION, _middleware.LAGER_RESET), _defineProperty(_ref3, 'identifier', identifier), _ref3;
}

var methods = {
  get: 'GET',
  post: 'POST',
  put: 'PUT',
  destroy: 'DELETE'
};

function methodsReducer(sum, method, key) {
  return Object.assign(sum, _defineProperty({}, key, function fetchMethodWrapper(input, init) {
    return (0, _fetchWrap.requestHelper)(function (helper) {
      return fetch.apply(null, helper(input, init));
    }).applyToInit({ method: method });
  }));
}

_lodash2.default.reduce(methods, methodsReducer, fetch);