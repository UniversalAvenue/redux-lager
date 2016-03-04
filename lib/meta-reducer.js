'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = metaReducer;

var _updeep = require('updeep');

var _updeep2 = _interopRequireDefault(_updeep);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

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

function metaReducer() {
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
            updatedAt: Date.now()
          };
        });
        return (0, _updeep2.default)(updates, state);
      }
    default:
      return state;
  }
}