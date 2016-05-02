'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.inflate = inflate;
exports.getEntityKeys = getEntityKeys;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _updeep = require('updeep');

var _updeep2 = _interopRequireDefault(_updeep);

var _EntitySchema = require('normalizr/lib/EntitySchema');

var _EntitySchema2 = _interopRequireDefault(_EntitySchema);

var _IterableSchema = require('normalizr/lib/IterableSchema');

var _IterableSchema2 = _interopRequireDefault(_IterableSchema);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function inflate(data, schema, selectEntity) {
  return function (state) {
    if (data === undefined) {
      return data;
    }
    if (schema instanceof _EntitySchema2.default) {
      var _ret = function () {
        var base = selectEntity(schema.getKey())(data)(state);
        if (!base) {
          return {
            v: base
          };
        }
        var keys = _lodash2.default.filter(_lodash2.default.keys(schema), function (k) {
          return k.indexOf('_') !== 0;
        });
        return {
          v: _lodash2.default.reduce(keys, function (sum, key) {
            return (0, _updeep2.default)(_defineProperty({}, key, inflate(base[key], schema[key], selectEntity)(state)), sum);
          }, base)
        };
      }();

      if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
    } else if (schema instanceof _IterableSchema2.default) {
      return _lodash2.default.map(data, function (id) {
        return inflate(id, schema.getItemSchema(), selectEntity)(state);
      });
    }
    return _lodash2.default.reduce(schema, function (sum, _schema, key) {
      return (0, _updeep2.default)(_defineProperty({}, key, inflate(data[key], schema[key], selectEntity)(state)), sum);
    }, {});
  };
}

function getEntityKeys(schema) {
  var knownKeys = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

  if (schema === undefined) {
    return [];
  }
  if (schema instanceof _IterableSchema2.default) {
    return getEntityKeys(schema.getItemSchema());
  }
  var keys = [];
  if (schema instanceof _EntitySchema2.default) {
    keys = [schema.getKey()];
    if (knownKeys.indexOf(keys[0]) > -1) {
      return [];
    }
  }
  var relKeys = _lodash2.default.flattenDeep((0, _lodash2.default)(_lodash2.default.keys(schema)).filter(function (k) {
    return k.indexOf('_') !== 0;
  }).map(function (key) {
    return getEntityKeys(schema[key], keys);
  }).value());
  return [].concat(_toConsumableArray(keys), _toConsumableArray(relKeys));
}