'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchPage = exports.ENTITIES_FAILURE = exports.ENTITIES_SUCCESS = exports.ENTITIES_REQUEST = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.fetch = fetch;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _middleware = require('./middleware');

var _select = require('./select');

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

// fetch.get('/me/resource').appendQuery

var fetchPage = exports.fetchPage = function fetchPage(path, schema, query) {
  var pages = [];
  var isLoading = (0, _select.selectIsPageLoading)(path);
  var fetchOnDefer = function fetchOnDefer(dispatch, getState) {
    return function () {
      _lodash2.default.uniq(pages).map(function (page) {
        if (!isLoading(page)(getState())) {
          dispatch(fetch(path, schema, _extends({}, query, { page: page })));
        }
      });
      pages.length = 0;
    };
  };
  return function (page) {
    return function (dispatch, getState) {
      pages.push(page);
      _lodash2.default.defer(fetchOnDefer(dispatch, getState));
    };
  };
};