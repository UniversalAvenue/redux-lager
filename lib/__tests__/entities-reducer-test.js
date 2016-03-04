'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

jest.dontMock('../entities-reducer');
jest.dontMock('../middleware');

var _require = require('../middleware');

var LAGER_SUCCESS = _require.LAGER_SUCCESS;
var LAGER_ACTION = _require.LAGER_ACTION;

var entities = require('../entities-reducer').default;

describe('MetaReducer', function () {
  var state = {};
  var successWith = function successWith(data) {
    return _extends(_defineProperty({}, LAGER_ACTION, LAGER_SUCCESS), data);
  };
  it('should store entities', function () {
    var oneEntityAction = successWith({
      response: {
        entities: {
          users: {
            1: {
              name: 'Karl'
            }
          }
        }
      }
    });
    state = entities(state, oneEntityAction);
    expect(state.users[1].name).toEqual('Karl');
  });
  it('should append entities', function () {
    var oneEntityAction = successWith({
      response: {
        entities: {
          users: {
            1: {
              age: 15
            }
          }
        }
      }
    });
    state = entities(state, oneEntityAction);
    expect(state.users[1].name).toEqual('Karl');
    expect(state.users[1].age).toEqual(15);
  });
  it('should append nested structure of entities', function () {
    var oneEntityAction = successWith({
      response: {
        entities: {
          users: {
            1: {
              interests: {
                rowing: {
                  grade: 15,
                  time: 10
                }
              }
            }
          }
        }
      }
    });
    state = entities(state, oneEntityAction);
    var anotherEntityAction = successWith({
      response: {
        entities: {
          users: {
            1: {
              interests: {
                rowing: {
                  grade: 25
                },
                fishing: {
                  grade: 99
                }
              }
            }
          }
        }
      }
    });
    state = entities(state, anotherEntityAction);
    var lastEntityAction = successWith({
      response: {
        entities: {
          users: {
            1: {
              interests: {}
            }
          }
        }
      }
    });
    state = entities(state, lastEntityAction);
    expect(state.users[1].name).toEqual('Karl');
    expect(state.users[1].age).toEqual(15);
    expect(state.users[1].interests.rowing.grade).toEqual(25);
    expect(state.users[1].interests.rowing.time).toEqual(10);
    expect(state.users[1].interests.fishing.grade).toEqual(99);
  });
});