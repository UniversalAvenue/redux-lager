'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.requestHelper = requestHelper;
exports.default = fetchWrap;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _requestHelpers = require('./request-helpers');

var helpers = _interopRequireWildcard(_requestHelpers);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function requestHelper() {
  for (var _len = arguments.length, middlewares = Array(_len), _key = 0; _key < _len; _key++) {
    middlewares[_key] = arguments[_key];
  }

  return _lodash2.default.reduce(helpers, function (sum, helper, key) {
    return _extends({}, sum, _defineProperty({}, key, function () {
      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      return requestHelper.apply(null, [].concat(middlewares, [helper.apply(null, args)]));
    }));
  }, {
    value: function value() {
      return function () {
        for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
          args[_key3] = arguments[_key3];
        }

        return _lodash2.default.reduce(middlewares, function (sum, ware) {
          return ware.apply(null, sum);
        }, args);
      };
    }
  });
}

function prepareNothing() {
  for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
    args[_key4] = arguments[_key4];
  }

  return args;
}

function fetchWrap(options) {
  var fetch = options.fetch;
  var prepareRequest = options.prepareRequest;

  for (var _len5 = arguments.length, prepareArgs = Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
    prepareArgs[_key5 - 1] = arguments[_key5];
  }

  var prep = prepareRequest ? prepareRequest.apply(null, [requestHelper()].concat(prepareArgs)) : prepareNothing;
  return function fetcher(input, init) {
    return fetch.apply(null, prep(input, init));
  };
}