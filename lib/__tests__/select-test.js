'use strict';

var _normalizr = require('normalizr');

jest.dontMock('../select');
jest.dontMock('../inflatr');

var lager = require('../select');

var user = new _normalizr.Schema('users');

var sibling = new _normalizr.Schema('users');

user.define({
  siblings: (0, _normalizr.arrayOf)(sibling)
});

var state = {
  lager: {
    entities: {
      users: {
        1: {
          name: 'Kalle',
          siblings: [2]
        },
        2: {
          name: 'Olle',
          siblings: [1]
        },
        3: {
          name: 'Sven',
          siblings: []
        }
      }
    },
    pagination: {
      '/users/all': {
        perPage: 1,
        totalEntries: 3,
        pages: {
          0: {
            users: [1]
          },
          1: {
            users: [2]
          },
          2: {
            users: [3]
          }
        }
      },
      '/users/most': {
        perPage: 5,
        totalEntries: 30,
        pages: {
          0: {
            users: [1, 2, 3]
          },
          3: {
            loading: true
          }
        }
      }
    },
    result: {
      '/users/siblings': {
        result: {
          users: [1, 2]
        }
      },
      '/users': {
        loading: true
      },
      '/users/success': {
        loading: false
      },
      '/users/failure': {
        loading: false,
        error: true
      }
    }
  }
};

describe('SelectEntity', function () {
  it('should return user with id 1', function () {
    var user1 = lager.selectEntity('users')(1)(state);
    expect(user1.name).toEqual('Kalle');
  });
});

describe('SelectEntities', function () {
  it('should return users with id 1 and 2', function () {
    var users = lager.selectEntities('users')([1, 2])(state);
    expect(users[0].name).toEqual('Kalle');
    expect(users[1].name).toEqual('Olle');
  });
});

describe('SelectFullEntity', function () {
  it('should return user with id 1 and sibling named Olle', function () {
    var user1 = lager.selectInflatedEntity(user)(1)(state);
    expect(user1.siblings[0].name).toEqual('Olle');
  });
  it('should return user with id 3 that has no siblings', function () {
    var user1 = lager.selectInflatedEntity(user)(3)(state);
    expect(user1.siblings.length).toEqual(0);
  });
});

describe('SelectResult', function () {
  it('should return two users', function () {
    var result = lager.selectResult('/users/siblings', { users: (0, _normalizr.arrayOf)(user) })(state).result;
    expect(result.users.length).toEqual(2);
  });
});

describe('SelectFetchState', function () {
  it('should return "requested" for request inprogress', function () {
    var result = lager.selectFetchState('/users')(state);
    expect(result).toEqual(lager.FETCH_STATE_REQUESTED);
  });
  it('should return NULL for request that has not been made', function () {
    var result = lager.selectFetchState('/users/not-found')(state);
    expect(result).toEqual(null);
  });
  it('should return "failed" for request inprogress', function () {
    var result = lager.selectFetchState('/users/failure')(state);
    expect(result).toEqual(lager.FETCH_STATE_FAILED);
  });
  it('should return "completed" for request that has succeeded', function () {
    var result = lager.selectFetchState('/users/success')(state);
    expect(result).toEqual(lager.FETCH_STATE_COMPLETED);
  });
});

describe('SelectRowGetter', function () {
  var selector = lager.selectRowGetter('/users/all', {
    users: (0, _normalizr.arrayOf)(user)
  });
  var rowGetter = selector(state);
  it('should return user 1', function () {
    var user1 = rowGetter(0).users;
    expect(user1.name).toEqual('Kalle');
  });
  it('should return user 3', function () {
    var user3 = rowGetter(2).users;
    expect(user3.name).toEqual('Sven');
  });
});

describe('SelectMissingPages', function () {
  it('should indicate that one page is missing', function () {
    var missingPages = lager.selectMissingPages('/users/most', false)(state);
    expect(missingPages(0, 9)).toEqual([1]);
  });
  it('should indicate that two pages are missing', function () {
    var missingPages = lager.selectMissingPages('/users/most', false)(state);
    expect(missingPages(10, 20)).toEqual([2, 4]);
  });
});