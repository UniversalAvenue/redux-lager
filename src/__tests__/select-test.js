jest.dontMock('../select');

const lager = require('../select');

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
    },
    result: {
      '/users/siblings': {
        users: [1, 2],
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
    const user1 = lager.selectFullEntity('users', { siblings: 'users' })(1)(state);
    expect(user1.siblings[0].name).toEqual('Olle');
  });
  it('should return user with id 3 that has no siblings', () => {
    const user1 = lager.selectFullEntity('users', { siblings: 'users' })(3)(state);
    expect(user1.siblings.length).toEqual(0);
  });
});

describe('SelectResult', () => {
  it('should return two users', () => {
    const result = lager.selectResult('/users/siblings', { users: 'users' })(state);
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

describe('SelectPagedRow', () => {
  const base = lager.selectPagedRow('/users/all', {
    users: 'users',
  })(state);
  const fetchPage = jest.genMockFn();
  const selectRow = base(fetchPage);
  it('should return user 1', () => {
    const user1 = selectRow(0);
    expect(user1.name).toEqual('Kalle');
  });
  it('should return user 3', () => {
    const user3 = selectRow(2);
    expect(user3.name).toEqual('Sven');
  });
});
