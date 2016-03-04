'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LAGER_FAILURE = exports.LAGER_SUCCESS = exports.LAGER_REQUEST = exports.LAGER_ACTION = exports.LAGER_FETCH = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _fetchWrap = require('./fetch-wrap');

var _fetchWrap2 = _interopRequireDefault(_fetchWrap);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _normalizr = require('normalizr');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var LAGER_FETCH = exports.LAGER_FETCH = Symbol('Lager Fetch');
var LAGER_ACTION = exports.LAGER_ACTION = Symbol('Lager Action');

var LAGER_REQUEST = exports.LAGER_REQUEST = 'LAGER REQUEST';
var LAGER_SUCCESS = exports.LAGER_SUCCESS = 'LAGER SUCCESS';
var LAGER_FAILURE = exports.LAGER_FAILURE = 'LAGER FAILURE';

var buildCallApi = function buildCallApi(options) {
  return function (getState) {
    return function (input, schema, init) {
      return (0, _fetchWrap2.default)(options, getState())(input, init).then(function (response) {
        return response.json().then(function (json) {
          return { json: json, response: response };
        }, function (error) {
          return { error: error, response: response };
        });
      }).then(function (_ref) {
        var json = _ref.json;
        var response = _ref.response;
        var error = _ref.error;

        if (!response.ok) {
          return Promise.reject({ message: response.status + ': ' + response.statusText, error: error });
        }
        return (0, _normalizr.normalize)(json, schema);
      });
    };
  };
};

exports.default = function () {
  var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
  return function (store) {
    var callApi = buildCallApi(options)(store.getState);
    return function (next) {
      return function (action) {
        var lagerFetch = action[LAGER_FETCH];
        if (typeof lagerFetch === 'undefined') {
          return next(action);
        }

        var input = lagerFetch.input;
        var init = lagerFetch.init;
        var identifier = lagerFetch.identifier;
        var schema = lagerFetch.schema;
        var types = lagerFetch.types;


        if (!identifier) {
          identifier = input;
        }

        var state = undefined;
        if (typeof input === 'function') {
          state = state || store.getState();
          input = input(state);
        }
        if (typeof init === 'function') {
          state = state || store.getState();
          init = init(state);
        }
        if (typeof input !== 'string') {
          throw new Error('Specify a string input URL.');
        }
        if (!schema) {
          throw new Error('Specify one of the exported Schemas.');
        }
        if (!Array.isArray(types) || types.length !== 3) {
          throw new Error('Expected an array of three action types.');
        }
        if (!types.every(function (type) {
          return typeof type === 'string';
        })) {
          throw new Error('Expected action types to be strings.');
        }

        function actionWith(more, lagerType) {
          var finalAction = Object.assign({
            input: input,
            init: init,
            schemaKeys: _lodash2.default.keys(schema),
            identifier: identifier
          }, action, more);
          finalAction[LAGER_ACTION] = lagerType;
          delete finalAction[LAGER_FETCH];
          return finalAction;
        }

        var _types = _slicedToArray(types, 3);

        var requestType = _types[0];
        var successType = _types[1];
        var failureType = _types[2];

        next(actionWith({ type: requestType }, LAGER_REQUEST));

        return callApi(input, schema, init).then(function (response) {
          return next(actionWith({
            response: response,
            type: successType
          }, LAGER_SUCCESS));
        }, function (error) {
          return next(actionWith({
            type: failureType,
            error: error.message || 'Something bad happened'
          }, LAGER_FAILURE));
        });
      };
    };
  };
};