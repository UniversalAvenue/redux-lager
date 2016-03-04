'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = entitiesReducer;

var _updeep = require('updeep');

var _updeep2 = _interopRequireDefault(_updeep);

var _middleware = require('./middleware');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function entitiesReducer() {
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
}