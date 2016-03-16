'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.missingPagesSelector = exports.pageStatsSelector = exports.paginationSelector = exports.fetchStateSelector = exports.resultSelector = exports.entitySelector = exports.entitiesSelector = exports.FETCH_STATE_FAILED = exports.FETCH_STATE_COMPLETED = exports.FETCH_STATE_REQUESTED = undefined;
exports.inflatedEntitySelector = inflatedEntitySelector;
exports.rowGetterSelector = rowGetterSelector;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _updeep = require('updeep');

var _updeep2 = _interopRequireDefault(_updeep);

var _reselect = require('reselect');

var _inflatr = require('./inflatr');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var FETCH_STATE_REQUESTED = exports.FETCH_STATE_REQUESTED = 'requested';
var FETCH_STATE_COMPLETED = exports.FETCH_STATE_COMPLETED = 'completed';
var FETCH_STATE_FAILED = exports.FETCH_STATE_FAILED = 'failed';

var entitiesSelector = exports.entitiesSelector = function entitiesSelector(type) {
  return function (state) {
    return type ? _lodash2.default.get(state, 'lager.entities.' + type) : state.lager.entities;
  };
};

var entitySelector = exports.entitySelector = function entitySelector(type, id) {
  return function (state) {
    return _lodash2.default.get(state, 'lager.entities.' + type + '[' + id + ']');
  };
};

function inflatedEntitySelector(schema) {
  var entityTypes = (0, _inflatr.getEntityKeys)(schema);
  var entitySelectors = entityTypes.map(function (t) {
    return entitiesSelector(t);
  });
  return (0, _reselect.createSelector)(entitySelectors, function () {
    for (var _len = arguments.length, entities = Array(_len), _key = 0; _key < _len; _key++) {
      entities[_key] = arguments[_key];
    }

    return function (id) {
      var _schema = arguments.length <= 1 || arguments[1] === undefined ? schema : arguments[1];

      var entityStore = _lodash2.default.zipObject(entityTypes, entities);
      var getEntity = function getEntity(type) {
        return function (_id) {
          return function () {
            return _lodash2.default.get(entityStore, type + '.["' + _id + '"]');
          };
        };
      };
      return (0, _inflatr.inflate)(id, _schema, getEntity);
    };
  });
}

function append(prop) {
  if (!prop) {
    return '';
  }
  return '["' + prop + '"]';
}

var resultSelector = exports.resultSelector = function resultSelector(identifier, property) {
  return function (state) {
    return _lodash2.default.get(state, 'lager.result["' + identifier + '"]' + append(property));
  };
};

var fetchStateSelector = exports.fetchStateSelector = function fetchStateSelector(identifier) {
  return (0, _reselect.createSelector)(resultSelector(identifier, 'loading'), resultSelector(identifier, 'error'), function (loading, error) {
    if (loading) {
      return FETCH_STATE_REQUESTED;
    }
    if (error) {
      return FETCH_STATE_FAILED;
    }
    return FETCH_STATE_COMPLETED;
  });
};

var paginationSelector = exports.paginationSelector = function paginationSelector(identifier) {
  return function (state) {
    return _lodash2.default.get(state, 'lager.pagination["' + identifier + '"]');
  };
};

var pageStatsSelector = exports.pageStatsSelector = function pageStatsSelector(identifier) {
  return (0, _reselect.createSelector)(paginationSelector(identifier), function (store) {
    return store && _lodash2.default.omit(store, 'pages');
  });
};

function pageCoordinates(rowIndex, perPage) {
  return {
    pageId: Math.floor(rowIndex / perPage),
    pagePosition: rowIndex % perPage
  };
}

function rowGetterSelector(identifier, schema) {
  var entityTypes = (0, _inflatr.getEntityKeys)(schema);
  var entitySelectors = entityTypes.map(function (t) {
    return entitiesSelector(t);
  });
  return (0, _reselect.createSelector)([paginationSelector(identifier)].concat(_toConsumableArray(entitySelectors)), function (store) {
    for (var _len2 = arguments.length, entities = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      entities[_key2 - 1] = arguments[_key2];
    }

    return function (rowIndex) {
      if (!store) {
        return null;
      }
      var entityStore = _lodash2.default.zipObject(entityTypes, entities);
      var getEntity = function getEntity(type) {
        return function (id) {
          return function () {
            return _lodash2.default.get(entityStore, type + '.["' + id + '"]');
          };
        };
      };

      var _pageCoordinates = pageCoordinates(rowIndex, store.perPage);

      var pageId = _pageCoordinates.pageId;
      var pagePosition = _pageCoordinates.pagePosition;

      var page = store.pages[pageId];
      if (!page) {
        return null;
      }
      var row = _lodash2.default.reduce(schema, function (sum, sc, key) {
        return (0, _updeep2.default)(_defineProperty({}, key, page[key] && page[key][pagePosition]), sum);
      }, {});
      var flatSchema = _lodash2.default.reduce(schema, function (sum, sc, key) {
        return (0, _updeep2.default)(_defineProperty({}, key, schema[key].getItemSchema()), sum);
      }, {});
      return (0, _inflatr.inflate)(row, flatSchema, getEntity)();
    };
  });
}

var missingPagesSelector = exports.missingPagesSelector = function missingPagesSelector(identifier, eager) {
  return (0, _reselect.createSelector)(paginationSelector(identifier), function (store) {
    return function (min, max) {
      if (!store) {
        return null;
      }
      var minCoords = pageCoordinates(min, store.perPage);
      var maxCoords = pageCoordinates(max, store.perPage);
      var pad = eager ? 1 : 0;
      var maxPageId = Math.ceil(store.totalEntries / store.perPage) - 1;
      var pages = _lodash2.default.range(Math.max(minCoords.pageId - pad, 0), Math.min(maxCoords.pageId + pad, maxPageId) + 1);
      return _lodash2.default.filter(pages, function (pageId) {
        return !_lodash2.default.get(store, 'pages[' + pageId + ']');
      });
    };
  });
};