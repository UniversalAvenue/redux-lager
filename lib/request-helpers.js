'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setQuery = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.applyToInit = applyToInit;
exports.applyToInput = applyToInput;
exports.setHeaders = setHeaders;
exports.prependPath = prependPath;
exports.appendPath = appendPath;
exports.prependQuery = prependQuery;
exports.appendQuery = appendQuery;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _updeep = require('updeep');

var _updeep2 = _interopRequireDefault(_updeep);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function applyToInit(fn) {
  return function (input, init) {
    return [input, (0, _updeep2.default)(_lodash2.default.isFunction(fn) ? fn(input, init) : fn, init)];
  };
}

function applyToInput(fn) {
  return function (input, init) {
    return [fn(input), init];
  };
}

function setHeaders(_headers) {
  return applyToInit(function (input, init) {
    var headers = _lodash2.default.isFunction(_headers) ? _headers(input, init) : _headers;
    return {
      headers: headers
    };
  });
}

var setQuery = exports.setQuery = function setQuery(query) {
  return setHeaders({ query: query });
};

function prependPath(_prepend) {
  return applyToInput(function (input, init) {
    var prepend = _lodash2.default.isFunction(_prepend) ? _prepend(input, init) : _prepend;
    return _url2.default.resolve(prepend, input);
  });
}

function appendPath(_append) {
  return applyToInput(function (input, init) {
    var append = _lodash2.default.isFunction(_append) ? _append(input, init) : _append;
    return input + append;
  });
}

function prependQuery(_query) {
  return applyToInput(function (input, init) {
    var query = _lodash2.default.isFunction(_query) ? _query(input, init) : _query;
    var pieces = _url2.default.parse(input, true);
    return _url2.default.format(_extends({}, pieces, {
      query: _extends({}, query, pieces.query),
      search: undefined
    }));
  });
}

function appendQuery(_query) {
  return applyToInput(function (input, init) {
    var query = _lodash2.default.isFunction(_query) ? _query(input, init) : _query;
    var pieces = _url2.default.parse(input, true);
    return _url2.default.format(_extends({}, pieces, {
      query: _extends({}, pieces.query, query),
      search: undefined
    }));
  });
}