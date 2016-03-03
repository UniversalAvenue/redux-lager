'use strict';

jest.autoMockOff();

var lager = require('../index');

describe('redux-lager', function () {
  it('should be OK', function () {
    expect(lager).toBeDefined();
  });
});