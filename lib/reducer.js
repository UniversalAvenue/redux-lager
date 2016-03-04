'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _redux = require('redux');

var _metaReducer = require('./meta-reducer');

var _metaReducer2 = _interopRequireDefault(_metaReducer);

var _entitiesReducer = require('./entities-reducer');

var _entitiesReducer2 = _interopRequireDefault(_entitiesReducer);

var _resultReducer = require('./result-reducer');

var _resultReducer2 = _interopRequireDefault(_resultReducer);

var _paginationReducer = require('./pagination-reducer');

var _paginationReducer2 = _interopRequireDefault(_paginationReducer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _redux.combineReducers)({
  meta: _metaReducer2.default,
  entities: _entitiesReducer2.default,
  result: _resultReducer2.default,
  pagination: _paginationReducer2.default
});