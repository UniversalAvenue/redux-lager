jest.dontMock('../pagination-reducer');
jest.dontMock('../middleware');

const {
  LAGER_REQUEST,
  LAGER_FAILURE,
  LAGER_SUCCESS,
  LAGER_ACTION,
} = require('../middleware');
const pagination = require('../pagination-reducer').default;
const removePageParam = require('../pagination-reducer').removePageParam;

describe('removePageParam', () => {
  it('should remove page query param', () => {
    expect(removePageParam('me/resource?page=1')).toEqual('me/resource');
  });
});

describe('ResultReducer', () => {
  let state = {};
  const successWith = data => ({
    [LAGER_ACTION]: LAGER_SUCCESS,
    ...data,
  });
  const requestWith = data => ({
    [LAGER_ACTION]: LAGER_REQUEST,
    ...data,
  });
  const errorWith = data => ({
    [LAGER_ACTION]: LAGER_FAILURE,
    ...data,
  });
  const identifier = 'resource/1';
  it('should be loading on request', () => {
    const oneEntityAction = requestWith({
      endpoint: `${identifier}?page=1`,
      identifier: `${identifier}?page=1`,
    });
    state = pagination(state, oneEntityAction);
    expect(state[identifier].loading).toEqual(true);
    expect(state[identifier].pages[0].loading).toEqual(true);
  });
  it('should be failed on failed request', () => {
    const oneEntityAction = errorWith({
      endpoint: `${identifier}?page=1`,
      identifier: `${identifier}?page=1`,
    });
    state = pagination(state, oneEntityAction);
    expect(state[identifier].loading).toEqual(false);
    expect(state[identifier].error).toEqual(true);
    expect(state[identifier].pages[0].loading).toEqual(false);
  });
  it('should succeed on succes request', () => {
    const oneEntityAction = successWith({
      endpoint: `${identifier}?page=1`,
      identifier: `${identifier}?page=1`,
      response: {
        result: {
          users: [
            { id: 4, kalle: 2 },
            { id: 3, kalle: 2 },
            { id: 2, kalle: 2 },
          ],
          perPage: 3,
          totalEntries: 10,
          currentPage: 1,
        },
      },
      schemaKeys: ['users'],
    });
    state = pagination(state, oneEntityAction);
    expect(state[identifier].loading).toEqual(false);
    expect(state[identifier].pages[0].loading).toEqual(false);
    expect(state[identifier].error).toEqual(false);
    expect(state[identifier].pages[0].users.length).toEqual(3);
  });
  it('should be loading on second page request', () => {
    const oneEntityAction = requestWith({
      endpoint: `${identifier}?page=2`,
      identifier: `${identifier}?page=2`,
    });
    state = pagination(state, oneEntityAction);
    expect(state[identifier].pages[1].loading).toEqual(true);
  });
  it('should succeed on second page succes request', () => {
    const oneEntityAction = successWith({
      endpoint: `${identifier}?page=2`,
      identifier: `${identifier}?page=2`,
      response: {
        result: {
          users: [
            { id: 14, kalle: 2 },
            { id: 13, kalle: 2 },
            { id: 12, kalle: 2 },
          ],
          perPage: 3,
          totalEntries: 10,
          currentPage: 2,
        },
      },
      schemaKeys: ['users'],
    });
    state = pagination(state, oneEntityAction);
    expect(state[identifier].loading).toEqual(false);
    expect(state[identifier].error).toEqual(false);
    expect(state[identifier].pages[1].loading).toEqual(false);
    expect(state[identifier].pages[1].users.length).toEqual(3);
  });
});
