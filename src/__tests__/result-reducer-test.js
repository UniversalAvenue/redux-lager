jest.dontMock('../result-reducer');
jest.dontMock('../middleware');

const {
  LAGER_REQUEST,
  LAGER_FAILURE,
  LAGER_SUCCESS,
  LAGER_ACTION,
} = require('../middleware');
const result = require('../result-reducer').default;

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
      identifier,
    });
    state = result(state, oneEntityAction);
    expect(state[identifier].loading).toEqual(true);
  });
  it('should not be loading after request', () => {
    const oneEntityAction = successWith({
      identifier,
      response: {
        result: 5,
      },
    });
    state = result(state, oneEntityAction);
    expect(state[identifier].loading).toEqual(false);
    expect(state[identifier].result).toEqual(5);
  });
  it('should not be loading after failure', () => {
    const oneEntityAction = errorWith({
      identifier,
    });
    state = result(state, oneEntityAction);
    expect(state[identifier].loading).toEqual(false);
    expect(state[identifier].error).toEqual(true);
  });
});
