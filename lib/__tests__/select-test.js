'use strict';

jest.dontMock('../select');

var lager = require('../select');

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
      }
    },
    result: {
      '/users/siblings': {
        users: [1, 2]
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
    var user1 = lager.selectFullEntity('users', { siblings: 'users' })(1)(state);
    expect(user1.siblings[0].name).toEqual('Olle');
  });
  it('should return user with id 3 that has no siblings', function () {
    var user1 = lager.selectFullEntity('users', { siblings: 'users' })(3)(state);
    expect(user1.siblings.length).toEqual(0);
  });
});

describe('SelectResult', function () {
  it('should return two users', function () {
    var result = lager.selectResult('/users/siblings', { users: 'users' })(state);
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

describe('SelectPagedRow', function () {
  var base = lager.selectPagedRow('/users/all', {
    users: 'users'
  })(state);
  var fetchPage = jest.genMockFn();
  var selectRow = base(fetchPage);
  it('should return user 1', function () {
    var user1 = selectRow(0);
    expect(user1.name).toEqual('Kalle');
  });
  it('should return user 3', function () {
    var user3 = selectRow(2);
    expect(user3.name).toEqual('Sven');
  });
});