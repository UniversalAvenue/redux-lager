'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.inflate = inflate;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _updeep = require('updeep');

var _updeep2 = _interopRequireDefault(_updeep);

var _EntitySchema = require('normalizr/lib/EntitySchema');

var _EntitySchema2 = _interopRequireDefault(_EntitySchema);

var _IterableSchema = require('normalizr/lib/IterableSchema');

var _IterableSchema2 = _interopRequireDefault(_IterableSchema);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function inflate(data, schema, selectEntity) {
  return function (state) {
    if (schema instanceof _EntitySchema2.default) {
      var _ret = function () {
        var base = selectEntity(schema.getKey())(data)(state);
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
      return data.map(function (id) {
        return inflate(id, schema.getItemSchema(), selectEntity)(state);
      });
    }
    return _lodash2.default.reduce(schema, function (sum, _schema, key) {
      return (0, _updeep2.default)(_defineProperty({}, key, inflate(data[key], schema[key], selectEntity)(state)), sum);
    }, {});
  };
}