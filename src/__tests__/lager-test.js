jest.autoMockOff();

const lager = require('../index');

describe('redux-lager', () => {
  it('should be OK', () => {
    expect(lager).toBeDefined();
  });
});
