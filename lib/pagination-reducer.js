'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.removePageParam = removePageParam;
exports.default = paginationReducer;

var _updeep = require('updeep');

var _updeep2 = _interopRequireDefault(_updeep);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _middleware = require('./middleware');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function removePageParam(str) {
  var decomp = _url2.default.parse(str, true);
  if (decomp.query) {
    delete decomp.query.page;
    delete decomp.search;
  }
  return _url2.default.format(decomp);
}

function paginationReducer() {
  var state = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
  var action = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var lagerType = action[_middleware.LAGER_ACTION];
  if (!lagerType) {
    return state;
  }
  var identifier = action.identifier;
  var endpoint = action.endpoint;
  var schemaKeys = action.schemaKeys;

  var _url$parse = _url2.default.parse(endpoint, true);

  var _url$parse$query = _url$parse.query;
  _url$parse$query = _url$parse$query === undefined ? {} : _url$parse$query;
  var page = _url$parse$query.page;

  if (!page) {
    return state;
  }
  var id = removePageParam(identifier);
  switch (lagerType) {
    case _middleware.LAGER_SUCCESS:
      {
        var result = action.response.result;
        var currentPage = result.currentPage;
        var totalEntries = result.totalEntries;
        var perPage = result.perPage;

        return (0, _updeep2.default)(_defineProperty({}, id, {
          loading: false,
          error: false,
          pages: _defineProperty({}, currentPage - 1, _extends({}, _lodash2.default.pick(result, schemaKeys), {
            loading: false
          })),
          perPage: perPage,
          totalEntries: totalEntries
        }), state);
      }
    case _middleware.LAGER_REQUEST:
      {
        return (0, _updeep2.default)(_defineProperty({}, id, {
          loading: true,
          pages: _defineProperty({}, page - 1, {
            loading: true
          })
        }), state);
      }
    case _middleware.LAGER_FAILURE:
      return (0, _updeep2.default)(_defineProperty({}, id, {
        loading: false,
        error: true,
        pages: _defineProperty({}, page - 1, {
          loading: false
        })
      }), state);
    default:
      return state;
  }
}