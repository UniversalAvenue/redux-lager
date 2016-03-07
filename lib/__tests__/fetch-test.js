'use strict';

jest.dontMock('../fetch-wrap');
jest.dontMock('../request-helpers');

var pack = require('../fetch-wrap');
var fetchWrap = pack.default;
var requestHelper = pack.requestHelper;

describe('fetch without options', function () {
  var fetchMock = undefined;
  var fetch = undefined;
  beforeEach(function () {
    fetchMock = jest.genMockFunction();
    fetch = fetchWrap({
      fetch: fetchMock
    });
  });
  it('should preserve request params', function () {
    fetch('/resource', { headers: { test: 5 } });
    expect(fetchMock.mock.calls[0]).toEqual(['/resource', {
      headers: { test: 5 }
    }]);
  });
});

describe('prepareRequest', function () {
  it('should be chainable', function () {
    var fn = requestHelper(function (id) {
      return id;
    }).applyToInit(function () {
      return {};
    }).value();
    expect(fn('test', {})).toEqual(['test', {}]);
  });
  it('should not overwrite something without cause', function () {
    var fn = requestHelper(function (id) {
      return id;
    }).applyToInit(function () {
      return {};
    }).value();
    expect(fn('test', { help: 'me' })).toEqual(['test', { help: 'me' }]);
  });
  it('should overwrite something with cause', function () {
    var fn = requestHelper(function (id) {
      return id;
    }).applyToInit(function () {
      return { help: 'ok' };
    }).value();
    expect(fn('test', { help: 'me' })).toEqual(['test', { help: 'ok' }]);
  });

  it('should create a pre/appended path', function () {
    var fn = requestHelper(function (id) {
      return id;
    }).prependPath('https://universalavenue.com').appendPath('?query=true').value();
    expect(fn('resource/id')).toEqual(['https://universalavenue.com/resource/id?query=true', undefined]);
    expect(fn('/resource/id')).toEqual(['https://universalavenue.com/resource/id?query=true', undefined]);
  });

  it('should append query', function () {
    var fn = requestHelper(function (id) {
      return id;
    }).appendQuery({
      auth: true
    }).value();
    expect(fn('resource/id')).toEqual(['resource/id?auth=true', undefined]);
  });
  it('should overwrite on append query', function () {
    var fn = requestHelper(function (id) {
      return id;
    }).appendQuery({
      auth: true
    }).value();
    expect(fn('resource/id?auth=false')).toEqual(['resource/id?auth=true', undefined]);
  });
  it('should not overwrite on prepend query', function () {
    var fn = requestHelper(function (id) {
      return id;
    }).prependQuery({
      auth: true
    }).value();
    expect(fn('resource/id?auth=false')).toEqual(['resource/id?auth=false', undefined]);
  });
});

describe('fetch with prepareRequest', function () {
  var fetchMock = undefined;
  var fetch = undefined;
  function applyAuthToken() {
    return {
      headers: {
        authorization: 'token'
      }
    };
  }
  beforeEach(function () {
    fetchMock = jest.genMockFunction();
    fetch = fetchWrap({
      prepareRequest: function prepareRequest(req) {
        return req.applyToInit(applyAuthToken).value();
      },
      fetch: fetchMock
    });
  });
  it('should preserve request params', function () {
    fetch('/resource', { headers: { test: 5 } });
    expect(fetchMock.mock.calls[0]).toEqual(['/resource', {
      headers: {
        test: 5,
        authorization: 'token'
      }
    }]);
  });
});