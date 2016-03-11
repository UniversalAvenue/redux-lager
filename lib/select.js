'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.selectMissingPages = exports.selectPageStats = exports.selectRowGetter = exports.selectIsPageLoading = exports.selectFetchState = exports.selectResult = exports.selectInflatedEntity = exports.selectEntity = exports.selectEntities = exports.FETCH_STATE_FAILED = exports.FETCH_STATE_COMPLETED = exports.FETCH_STATE_REQUESTED = undefined;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _updeep = require('updeep');

var _updeep2 = _interopRequireDefault(_updeep);

var _inflatr = require('./inflatr');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var FETCH_STATE_REQUESTED = exports.FETCH_STATE_REQUESTED = 'requested';
var FETCH_STATE_COMPLETED = exports.FETCH_STATE_COMPLETED = 'completed';
var FETCH_STATE_FAILED = exports.FETCH_STATE_FAILED = 'failed';

var selectEntities = exports.selectEntities = function selectEntities(type) {
  return function (ids) {
    return function (state) {
      var all = _lodash2.default.get(state, 'lager.entities.' + type);
      return _lodash2.default.map(ids, function (id) {
        return all[id];
      });
    };
  };
};

var selectEntity = exports.selectEntity = function selectEntity(type) {
  return function (id) {
    return function (state) {
      return _lodash2.default.get(state, 'lager.entities.' + type + '[' + id + ']');
    };
  };
};

var selectInflatedEntity = exports.selectInflatedEntity = function selectInflatedEntity(schema) {
  return function (id) {
    return (0, _inflatr.inflate)(id, schema, selectEntity);
  };
};

var selectResult = exports.selectResult = function selectResult(identifier, schema) {
  return function (state) {
    var store = _lodash2.default.get(state, 'lager.result["' + identifier + '"]');
    if (!store) {
      return null;
    }
    var result = (0, _inflatr.inflate)(store.result, schema, selectEntity)(state);
    return (0, _updeep2.default)({
      result: result
    }, store);
  };
};

var selectFetchState = exports.selectFetchState = function selectFetchState(identifier) {
  return function (state) {
    var store = _lodash2.default.get(state, 'lager.result["' + identifier + '"]');
    if (!store) {
      return null;
    }
    var result = _lodash2.default.pick(store, 'loading', 'error');
    if (result.loading) {
      return FETCH_STATE_REQUESTED;
    }
    if (result.error) {
      return FETCH_STATE_FAILED;
    }
    return FETCH_STATE_COMPLETED;
  };
};

var selectIsPageLoading = exports.selectIsPageLoading = function selectIsPageLoading(identifier) {
  return function (page) {
    return function (state) {
      var store = _lodash2.default.get(state, 'lager.pagination["' + identifier + '"].pages[' + (page - 1) + ']');
      if (!store) {
        return false;
      }
      return store.loading;
    };
  };
};

function pageCoordinates(rowIndex, perPage) {
  return {
    pageId: Math.floor(rowIndex / perPage),
    pagePosition: rowIndex % perPage
  };
}

var selectRowGetter = exports.selectRowGetter = function selectRowGetter(identifier, schema) {
  return function (state) {
    var store = _lodash2.default.get(state, 'lager.pagination["' + identifier + '"]');
    if (!store) {
      return null;
    }
    return function (rowIndex) {
      var _pageCoordinates = pageCoordinates(rowIndex, store.perPage);

      var pageId = _pageCoordinates.pageId;
      var pagePosition = _pageCoordinates.pagePosition;

      var page = store.pages[pageId];
      if (!page) {
        return null;
      }
      var row = _lodash2.default.reduce(schema, function (sum, sc, key) {
        return (0, _updeep2.default)(_defineProperty({}, key, page[key][pagePosition]), sum);
      }, {});
      var flatSchema = _lodash2.default.reduce(schema, function (sum, sc, key) {
        return (0, _updeep2.default)(_defineProperty({}, key, schema[key].getItemSchema()), sum);
      }, {});
      return (0, _inflatr.inflate)(row, flatSchema, selectEntity)(state);
    };
  };
};

var selectPageStats = exports.selectPageStats = function selectPageStats(identifier) {
  return function (state) {
    var store = _lodash2.default.get(state, 'lager.pagination["' + identifier + '"]');
    if (!store) {
      return null;
    }
    return _lodash2.default.omit(store, 'pages');
  };
};

var selectMissingPages = exports.selectMissingPages = function selectMissingPages(identifier, eager) {
  return function (state) {
    var store = _lodash2.default.get(state, 'lager.pagination["' + identifier + '"]');
    if (!store) {
      return null;
    }
    return function (min, max) {
      var minCoords = pageCoordinates(min, store.perPage);
      var maxCoords = pageCoordinates(max, store.perPage);
      var pad = eager ? 1 : 0;
      var maxPageId = Math.ceil(store.totalEntries / store.perPage);
      var pages = _lodash2.default.range(Math.max(minCoords.pageId - pad, 0), Math.min(maxCoords.pageId + pad, maxPageId) + 1);
      return _lodash2.default.filter(pages, function (pageId) {
        return !store.pages[pageId];
      });
    };
  };
};