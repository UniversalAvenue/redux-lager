import { Schema, arrayOf } from 'normalizr';
jest.dontMock('../select');
jest.dontMock('../inflatr');

const lager = require('../select');

const user = new Schema('users');

const sibling = new Schema('users');

user.define({
  siblings: arrayOf(sibling),
});

const state = {
  lager: {
    entities: {
      users: {
        1: {
          name: 'Kalle',
          siblings: [2],
        },
        2: {
          name: 'Olle',
          siblings: [1],
        },
        3: {
          name: 'Sven',
          siblings: [],
        },
      },
    },
    pagination: {
      '/users/all': {
        perPage: 1,
        totalEntries: 3,
        pages: {
          0: {
            users: [1],
          },
          1: {
            users: [2],
          },
          2: {
            users: [3],
          },
        },
      },
      '/users/most': {
        perPage: 5,
        totalEntries: 30,
        pages: {
          0: {
            users: [1, 2, 3],
          },
          3: {
            loading: true,
          },
        },
      },
    },
    result: {
      '/users/siblings': {
        result: {
          users: [1, 2],
        },
      },
      '/users': {
        loading: true,
      },
      '/users/success': {
        loading: false,
      },
      '/users/failure': {
        loading: false,
        error: true,
      },
    },
  },
};

describe('SelectEntity', () => {
  it('should return user with id 1', () => {
    const user1 = lager.selectEntity('users')(1)(state);
    expect(user1.name).toEqual('Kalle');
  });
});

describe('SelectEntities', () => {
  it('should return users with id 1 and 2', () => {
    const users = lager.selectEntities('users')([1, 2])(state);
    expect(users[0].name).toEqual('Kalle');
    expect(users[1].name).toEqual('Olle');
  });
});

describe('SelectFullEntity', () => {
  it('should return user with id 1 and sibling named Olle', () => {
    const user1 = lager.selectInflatedEntity(user)(1)(state);
    expect(user1.siblings[0].name).toEqual('Olle');
  });
  it('should return user with id 3 that has no siblings', () => {
    const user1 = lager.selectInflatedEntity(user)(3)(state);
    expect(user1.siblings.length).toEqual(0);
  });
});

describe('SelectResult', () => {
  it('should return two users', () => {
    const result = lager.selectResult('/users/siblings', { users: arrayOf(user) })(state).result;
    expect(result.users.length).toEqual(2);
  });
});

describe('SelectFetchState', () => {
  it('should return "requested" for request inprogress', () => {
    const result = lager.selectFetchState('/users')(state);
    expect(result).toEqual(lager.FETCH_STATE_REQUESTED);
  });
  it('should return NULL for request that has not been made', () => {
    const result = lager.selectFetchState('/users/not-found')(state);
    expect(result).toEqual(null);
  });
  it('should return "failed" for request inprogress', () => {
    const result = lager.selectFetchState('/users/failure')(state);
    expect(result).toEqual(lager.FETCH_STATE_FAILED);
  });
  it('should return "completed" for request that has succeeded', () => {
    const result = lager.selectFetchState('/users/success')(state);
    expect(result).toEqual(lager.FETCH_STATE_COMPLETED);
  });
});

describe('SelectRowGetter', () => {
  const selector = lager.selectRowGetter('/users/all', {
    users: arrayOf(user),
  });
  const rowGetter = selector(state);
  it('should return user 1', () => {
    const user1 = rowGetter(0).users;
    expect(user1.name).toEqual('Kalle');
  });
  it('should return user 3', () => {
    const user3 = rowGetter(2).users;
    expect(user3.name).toEqual('Sven');
  });
});

describe('SelectMissingPages', () => {
  it('should indicate that one page is missing', () => {
    const missingPages = lager.selectMissingPages('/users/most', false)(state);
    expect(missingPages(0, 9)).toEqual([1]);
  });
  it('should indicate that two pages are missing', () => {
    const missingPages = lager.selectMissingPages('/users/most', false)(state);
    expect(missingPages(10, 20)).toEqual([2, 4]);
  });
});
