'use strict';

var _normalizr = require('normalizr');

jest.dontMock('../inflatr');

var inflate = require('../inflatr').inflate;

describe('Inflate', function () {
  var user = new _normalizr.Schema('users');
  var role = new _normalizr.Schema('roles');
  var address = new _normalizr.Schema('addresses');
  user.define({
    role: role,
    locations: (0, _normalizr.arrayOf)(address)
  });

  var kalle = {
    id: 5,
    role: {
      name: 'Kalix',
      id: 2
    },
    locations: [{ id: 1, name: 'home' }, { id: 2, name: 'work' }, { id: 3, name: 'hospice' }]
  };

  var olle = {
    id: 6,
    role: {
      name: 'Phenix',
      id: 3
    },
    locations: [{ id: 1, name: 'home' }, { id: 2, name: 'work' }, { id: 3, name: 'hospice' }]
  };

  var db = {
    items: (0, _normalizr.arrayOf)(user)
  };

  var allUsers = {
    items: [kalle, olle]
  };

  var weirdSchema = {
    item: {
      user: user
    }
  };

  var weirdData = {
    item: {
      user: kalle
    }
  };

  var selectEntity = function selectEntity(type) {
    return function (id) {
      return function (entities) {
        return entities[type][id];
      };
    };
  };
  it('should reinflate a nested object', function () {
    var response = (0, _normalizr.normalize)(kalle, user);
    var inflated = inflate(response.result, user, selectEntity)(response.entities);

    expect(inflated).toEqual(kalle);
  });
  it('should reinflate a more nested object', function () {
    var response = (0, _normalizr.normalize)(allUsers, db);
    var inflated = inflate(response.result, db, selectEntity)(response.entities);

    expect(inflated).toEqual(allUsers);
  });
  it('should reinflate a weird structure', function () {
    var response = (0, _normalizr.normalize)(weirdData, weirdSchema);
    var inflated = inflate(response.result, weirdSchema, selectEntity)(response.entities);

    expect(inflated).toEqual(weirdData);
  });
});