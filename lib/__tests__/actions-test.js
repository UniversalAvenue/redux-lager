'use strict';

jest.dontMock('../actions');
jest.dontMock('../middleware');
jest.dontMock('../fetch-wrap');
jest.dontMock('../request-helpers');

var fetch = require('../actions').fetch;
var LAGER_FETCH = require('../middleware').LAGER_FETCH;

describe('Fetch action', function () {
  it('should work in basic case', function () {
    var result = fetch('/me/resource', {
      headers: {
        auth: true
      }
    })[LAGER_FETCH];
    expect(result.init.headers.auth).toEqual(true);
  });
});

describe('Fetch get action', function () {
  it('should work in basic case', function () {
    var result = fetch.get('/me/resource').setHeaders({
      auth: true
    }).value()[LAGER_FETCH];
    expect(result.init.headers.auth).toEqual(true);
    expect(result.init.method).toEqual('GET');
  });
});