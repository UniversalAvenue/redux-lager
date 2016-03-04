jest.dontMock('../meta-reducer');
jest.dontMock('../middleware');

const { LAGER_SUCCESS, LAGER_ACTION } = require('../middleware');
const meta = require('../meta-reducer').default;

describe('MetaReducer', () => {
  let state = {};
  let lastUpdate = 0;
  const actionWith = users => ({
    [LAGER_ACTION]: LAGER_SUCCESS,
    response: {
      entities: {
        users: {
          ...users,
        },
      },
    },
  });
  it('should update updatedAt value', () => {
    const oneEntityAction = actionWith({
      15: {
        name: 'kalle',
      },
    });
    state = meta(state, oneEntityAction);
    lastUpdate = state.users[15].updatedAt;
    expect(lastUpdate).toBeDefined();
  });
  it('should overwrite updatedAt value', () => {
    const oneEntityAction = actionWith({
      15: {
        name: 'kalle',
      },
    });
    state = meta(state, oneEntityAction);
    const newUpdatedAt = state.users[15].updatedAt;
    expect(lastUpdate).toBeLessThan(newUpdatedAt);
  });
  it('should update multiple entities', () => {
    const oneEntityAction = actionWith({
      25: {
        name: 'kalle',
      },
      29: {
        name: 'kalle',
      },
      52: {
        name: 'kalle',
      },
      24: {
        name: 'kalle',
      },
    });
    state = meta(state, oneEntityAction);
    expect(Object.keys(state.users).length).toEqual(5);
  });
});
