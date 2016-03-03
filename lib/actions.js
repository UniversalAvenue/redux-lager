'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchPage = exports.fetch = exports.ENTITIES_FAILURE = exports.ENTITIES_SUCCESS = exports.ENTITIES_REQUEST = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _middleware = require('./middleware');

var _select = require('./select');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var ENTITIES_REQUEST = exports.ENTITIES_REQUEST = 'ENTITIES_REQUEST';
var ENTITIES_SUCCESS = exports.ENTITIES_SUCCESS = 'ENTITIES_SUCCESS';
var ENTITIES_FAILURE = exports.ENTITIES_FAILURE = 'ENTITIES_FAILURE';

var fetch = exports.fetch = function fetch(path, schema, _ref) {
  var _ref$method = _ref.method;
  var method = _ref$method === undefined ? 'GET' : _ref$method;
  var data = _ref.data;
  var identifier = _ref.identifier;
  var query = _ref.query;
  return _defineProperty({}, _middleware.LAGER_FETCH, {
    types: [ENTITIES_REQUEST, ENTITIES_SUCCESS, ENTITIES_FAILURE],
    endpoint: path,
    schema: schema,
    query: query,
    data: data,
    identifier: identifier,
    fetchOptions: {
      method: method
    }
  });
};

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