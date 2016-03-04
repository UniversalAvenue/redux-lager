'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = resultReducer;

var _updeep = require('updeep');

var _updeep2 = _interopRequireDefault(_updeep);

var _middleware = require('./middleware');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function resultReducer() {
  var state = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
  var action = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var lagerType = action[_middleware.LAGER_ACTION];
  if (!lagerType) {
    return state;
  }
  var identifier = action.identifier;


  switch (lagerType) {
    case _middleware.LAGER_SUCCESS:
      {
        var result = action.response.result;

        return (0, _updeep2.default)(_defineProperty({}, identifier, {
          loading: false,
          result: result
        }), state);
      }
    case _middleware.LAGER_REQUEST:
      return (0, _updeep2.default)(_defineProperty({}, identifier, {
        loading: true
      }), state);
    case _middleware.LAGER_FAILURE:
      return (0, _updeep2.default)(_defineProperty({}, identifier, {
        loading: false,
        error: true
      }), state);
    default:
      return state;
  }
}