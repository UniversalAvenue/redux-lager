'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _normalizr = require('normalizr');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

jest.autoMockOff();

var middleware = require('../middleware');

var LAGER_ACTION = middleware.LAGER_ACTION;
var LAGER_SUCCESS = middleware.LAGER_SUCCESS;


var lager = require('../selectors');
var reducer = require('../reducer').default;

var user = new _normalizr.Schema('users');

var sibling = new _normalizr.Schema('users');

user.define({
  siblings: (0, _normalizr.arrayOf)(sibling)
});

var usersPage = {
  users: (0, _normalizr.arrayOf)(user)
};

var role = new _normalizr.Schema('role');

var rolesPage = {
  roles: (0, _normalizr.arrayOf)(role)
};

function actionWith(data) {
  return _extends(_defineProperty({}, LAGER_ACTION, LAGER_SUCCESS), data);
}

function usersPageAction(response) {
  return actionWith({
    input: '/admin/users?page=1',
    identifier: 'users',
    schemaKeys: _lodash2.default.keys(usersPage),
    response: response
  });
}

function rolesPageAction(response) {
  return actionWith({
    input: '/admin/roles?page=1',
    identifier: 'roles',
    schemaKeys: _lodash2.default.keys(rolesPage),
    response: response
  });
}

var usersPageResponse = (0, _normalizr.normalize)({
  users: [{
    id: 1,
    name: 'Daniel',
    siblings: [{
      id: 11,
      name: 'David'
    }]
  }, {
    id: 2,
    name: 'Eleanor',
    siblings: [{
      id: 21,
      name: 'Elias'
    }, {
      id: 22,
      name: 'Désirée'
    }, {
      id: 23,
      name: 'Anne'
    }]
  }],
  totalEntries: 10
}, usersPage);

var secondUsersPageResponse = (0, _normalizr.normalize)({
  users: [{
    id: 1,
    name: 'Daniel Werthén',
    siblings: [{
      id: 11,
      name: 'David'
    }]
  }, {
    id: 2,
    name: 'Eleanor Lichtenstein',
    siblings: [{
      id: 21,
      name: 'Elias'
    }, {
      id: 22,
      name: 'Désirée'
    }, {
      id: 23,
      name: 'Anne'
    }]
  }],
  totalEntries: 10
}, usersPage);

var rolesPageResponse = (0, _normalizr.normalize)({
  roles: [{ id: 1, name: 'Worker' }, { id: 2, name: 'Boss' }],
  totalEntires: 20
}, rolesPage);

var state = {
  lager: reducer({}, usersPageAction(usersPageResponse))
};

describe('rowGetterSelector', function () {
  it('should have a base state', function () {
    expect(state).toBeDefined();
  });
  var selector = lager.rowGetterSelector('users', usersPage);
  var rowGetter = selector(state);
  it('should produce a rowGetter', function () {
    expect(rowGetter).toBeDefined();
  });
  var secondGetter = selector(state);
  it('should memoize output', function () {
    expect(secondGetter).toEqual(rowGetter);
  });
  var thirdGetter = lager.rowGetterSelector('users', usersPage)(state);
  it('should have an output that is equal to an unrelated output', function () {
    expect(thirdGetter).not.toEqual(rowGetter);
  });
  describe('rowGetter', function () {
    it('should produce a top user with name Daniel', function () {
      expect(rowGetter(0).users.name).toEqual('Daniel');
    });
    it('should produce a user with a sibling named David', function () {
      expect(rowGetter(0).users.siblings[0].name).toEqual('David');
    });
    var secondState = {
      lager: reducer(state.lager, rolesPageAction(rolesPageResponse))
    };
    var forthGetter = selector(secondState);
    it('should be equal to a new getter after an unrelated change', function () {
      expect(forthGetter).toEqual(rowGetter);
    });
    var thirdState = {
      lager: reducer(state.lager, usersPageAction(secondUsersPageResponse))
    };
    var fifthGetter = selector(thirdState);
    it('should not be equal to a new getter after an related change', function () {
      expect(fifthGetter).not.toEqual(rowGetter);
    });
    it('should reflect the new state', function () {
      expect(fifthGetter(0).users.name).toEqual('Daniel Werthén');
    });
  });
});

describe('missingPagesSelector', function () {
  var selector = lager.missingPagesSelector('users', true);
  var m1 = selector(state);
  var m2 = selector(state);
  it('should memoize the output', function () {
    expect(m1).toEqual(m2);
  });
});