import { Schema, arrayOf } from 'normalizr';
import _ from 'lodash';
import { normalize } from 'normalizr';
jest.autoMockOff();

const middleware = require('../middleware');

const {
  LAGER_ACTION,
  LAGER_SUCCESS,
} = middleware;

const lager = require('../selectors');
const reducer = require('../reducer').default;

const user = new Schema('users');

const sibling = new Schema('users');

user.define({
  siblings: arrayOf(sibling),
});

const usersPage = {
  users: arrayOf(user),
};

const role = new Schema('role');

const rolesPage = {
  roles: arrayOf(role),
};

const roles = {
  items: arrayOf(role),
};

function actionWith(data) {
  return {
    [LAGER_ACTION]: LAGER_SUCCESS,
    ...data,
  };
}

function usersPageAction(response) {
  return actionWith({
    input: '/admin/users?page=1',
    identifier: 'users',
    schemaKeys: _.keys(usersPage),
    response,
  });
}

function rolesPageAction(response) {
  return actionWith({
    input: '/admin/roles?page=1',
    identifier: 'roles',
    schemaKeys: _.keys(rolesPage),
    response,
  });
}

function rolesAction(input, response) {
  return actionWith({
    input,
    identifier: input,
    schemaKeys: _.keys(roles),
    response,
  });
}

const usersPageResponse = normalize({
  users: [
    {
      id: 1,
      name: 'Daniel',
      siblings: [
        {
          id: 11,
          name: 'David',
        },
      ],
    },
    {
      id: 2,
      name: 'Eleanor',
      siblings: [
        {
          id: 21,
          name: 'Elias',
        },
        {
          id: 22,
          name: 'Désirée',
        },
        {
          id: 23,
          name: 'Anne',
        },
      ],
    },
  ],
  totalEntries: 10,
}, usersPage);

const secondUsersPageResponse = normalize({
  users: [
    {
      id: 1,
      name: 'Daniel Werthén',
      siblings: [
        {
          id: 11,
          name: 'David',
        },
      ],
    },
    {
      id: 2,
      name: 'Eleanor Lichtenstein',
      siblings: [
        {
          id: 21,
          name: 'Elias',
        },
        {
          id: 22,
          name: 'Désirée',
        },
        {
          id: 23,
          name: 'Anne',
        },
      ],
    },
  ],
  totalEntries: 10,
}, usersPage);

const rolesPageResponse = normalize({
  roles: [
    { id: 1, name: 'Worker' },
    { id: 2, name: 'Boss' },
  ],
  totalEntries: 20,
}, rolesPage);

const rolesResponse = normalize({
  items: [
    { id: 1, name: 'Worker' },
    { id: 2, name: 'Boss' },
  ],
}, roles);

const state = {
  lager: reducer({}, usersPageAction(usersPageResponse)),
};

describe('rowGetterSelector', () => {
  it('should have a base state', () => {
    expect(state).toBeDefined();
  });
  const selector = lager.rowGetterSelector('users', usersPage);
  const rowGetter = selector(state);
  it('should produce a rowGetter', () => {
    expect(rowGetter).toBeDefined();
  });
  const secondGetter = selector(state);
  it('should memoize output', () => {
    expect(secondGetter).toEqual(rowGetter);
  });
  const thirdGetter = lager.rowGetterSelector('users', usersPage)(state);
  it('should have an output that is equal to an unrelated output', () => {
    expect(thirdGetter).not.toEqual(rowGetter);
  });
  describe('rowGetter', () => {
    it('should produce a top user with name Daniel', () => {
      expect(rowGetter(0).users.name).toEqual('Daniel');
    });
    it('should produce a user with a sibling named David', () => {
      expect(rowGetter(0).users.siblings[0].name).toEqual('David');
    });
    const secondState = {
      lager: reducer(state.lager, rolesPageAction(rolesPageResponse)),
    };
    const forthGetter = selector(secondState);
    it('should be equal to a new getter after an unrelated change', () => {
      expect(forthGetter).toEqual(rowGetter);
    });
    const thirdState = {
      lager: reducer(state.lager, usersPageAction(secondUsersPageResponse)),
    };
    const fifthGetter = selector(thirdState);
    it('should not be equal to a new getter after an related change', () => {
      expect(fifthGetter).not.toEqual(rowGetter);
    });
    it('should reflect the new state', () => {
      expect(fifthGetter(0).users.name).toEqual('Daniel Werthén');
    });
  });
});

describe('missingPagesSelector', () => {
  const selector = lager.missingPagesSelector('users', true);
  const m1 = selector(state);
  const m2 = selector(state);
  it('should memoize the output', () => {
    expect(m1).toEqual(m2);
  });
});

describe('inflatedResultSelector', () => {
  const rolesState = {
    lager: reducer({}, rolesAction('admin/roles', rolesResponse)),
  };
  const selector = lager.inflatedResultSelector('admin/roles', roles);
  const m1 = selector(rolesState);
  const m2 = selector(rolesState);
  it('should memoize the output', () => {
    expect(m1).toEqual(m2);
  });
  it('should have a fully inflated result', () => {
    expect(m1.items[0].name).toEqual('Worker');
    expect(m1.items[1].name).toEqual('Boss');
  });
});
