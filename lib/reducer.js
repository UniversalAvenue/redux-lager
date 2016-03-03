'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _updeep = require('updeep');

var _updeep2 = _interopRequireDefault(_updeep);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _redux = require('redux');

var _middleware = require('./middleware');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var entityMap = function entityMap(entities) {
  return function (iterator) {
    return _lodash2.default.reduce(entities, function (sum, entity, type) {
      return Object.assign(sum, _defineProperty({}, type, _lodash2.default.reduce(entity, function (_sum, item, id) {
        return Object.assign(_sum, _defineProperty({}, id, iterator(item, id, type)));
      }, {})));
    }, {});
  };
};

var metaReducer = function metaReducer() {
  var state = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
  var action = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var lagerType = action[_middleware.LAGER_ACTION];
  if (!lagerType) {
    return state;
  }
  switch (lagerType) {
    case _middleware.LAGER_SUCCESS:
      {
        var entities = action.response.entities;

        var updates = entityMap(entities)(function () {
          return {
            stale: false,
            updatedAt: Date.now()
          };
        });
        return (0, _updeep2.default)(updates, state);
      }
    default:
      return state;
  }
};

var resultReducer = function resultReducer() {
  var state = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
  var action = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var lagerType = action[_middleware.LAGER_ACTION];
  if (!lagerType) {
    return state;
  }
  var endpoint = action.endpoint;
  var identifier = action.identifier;


  var id = identifier || endpoint;
  switch (lagerType) {
    case _middleware.LAGER_SUCCESS:
      {
        var result = action.response.result;

        return (0, _updeep2.default)(_defineProperty({}, id, {
          loading: false,
          result: result
        }), state);
      }
    case _middleware.LAGER_REQUEST:
      return (0, _updeep2.default)(_defineProperty({}, id, {
        loading: true
      }), state);
    case _middleware.LAGER_FAILURE:
      return (0, _updeep2.default)(_defineProperty({}, id, {
        loading: false,
        error: true
      }), state);
    default:
      return state;
  }
};

var paginationReducer = function paginationReducer() {
  var state = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
  var action = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var lagerType = action[_middleware.LAGER_ACTION];
  if (!lagerType) {
    return state;
  }
  var identifier = action.identifier;
  var endpoint = action.endpoint;
  var schemaKeys = action.schemaKeys;

  var id = identifier || endpoint;
  var queriedPage = action.query && action.query.page || 0;
  if (!queriedPage) {
    return state;
  }
  var query = _lodash2.default.omit(action.query, 'page');
  switch (lagerType) {
    case _middleware.LAGER_SUCCESS:
      {
        var result = action.response.result;
        var currentPage = result.currentPage;
        var totalEntries = result.totalEntries;
        var nextPage = result.nextPage;

        return (0, _updeep2.default)(_defineProperty({}, id, {
          loading: false,
          pages: _defineProperty({}, currentPage - 1, _extends({}, _lodash2.default.pick(result, schemaKeys), {
            loading: false
          })),
          perPage: 30,
          query: query,
          nextPage: nextPage,
          totalEntries: totalEntries
        }), state);
      }
    case _middleware.LAGER_REQUEST:
      {
        var oldQuery = state[id] && state[id].query;
        if (_lodash2.default.isEqual(oldQuery, query) && queriedPage > 1) {
          return (0, _updeep2.default)(_defineProperty({}, id, {
            loading: true,
            pages: _defineProperty({}, queriedPage - 1, {
              loading: true
            })
          }), state);
        }
        return (0, _updeep2.default)(_defineProperty({}, id, {
          loading: true,
          pages: function pages() {
            return _defineProperty({}, queriedPage - 1, {
              loading: true
            });
          }
        }), state);
      }
    case _middleware.LAGER_FAILURE:
      return (0, _updeep2.default)(_defineProperty({}, id, {
        loading: false,
        error: true
      }), state);
    default:
      return state;
  }
};

var entitiesReducer = function entitiesReducer() {
  var state = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
  var action = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var lagerType = action[_middleware.LAGER_ACTION];
  if (!lagerType) {
    return state;
  }
  switch (lagerType) {
    case _middleware.LAGER_SUCCESS:
      {
        var entities = action.response.entities;

        return (0, _updeep2.default)(entities, state);
      }
    default:
      return state;
  }
};

exports.default = (0, _redux.combineReducers)({
  meta: metaReducer,
  entities: entitiesReducer,
  result: resultReducer,
  pagination: paginationReducer
});