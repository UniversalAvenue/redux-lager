jest.dontMock('../fetch-wrap');
jest.dontMock('../request-helpers');

const pack = require('../fetch-wrap');
const fetchWrap = pack.default;
const requestHelper = pack.requestHelper;

describe('fetch without options', () => {
  let fetchMock;
  let fetch;
  beforeEach(() => {
    fetchMock = jest.genMockFunction();
    fetch = fetchWrap({
      fetch: fetchMock,
    });
  });
  it('should preserve request params', () => {
    fetch('/resource', { headers: { test: 5 } });
    expect(fetchMock.mock.calls[0]).toEqual(['/resource', {
      headers: { test: 5 },
    }]);
  });
});

describe('prepareRequest', () => {
  it('should be chainable', () => {
    const fn = requestHelper()
      .applyToInit(() => ({}))
      .value();
    expect(fn('test', {})).toEqual(['test', {}]);
  });
  it('should not overwrite something without cause', () => {
    const fn = requestHelper()
      .applyToInit(() => ({}))
      .value();
    expect(fn('test', { help: 'me' })).toEqual(['test', { help: 'me' }]);
  });
  it('should overwrite something with cause', () => {
    const fn = requestHelper()
      .applyToInit(() => ({ help: 'ok' }))
      .value();
    expect(fn('test', { help: 'me' })).toEqual(['test', { help: 'ok' }]);
  });

  it('should create a pre/appended path', () => {
    const fn = requestHelper()
      .prependPath('https://universalavenue.com')
      .appendPath('?query=true')
      .value();
    expect(fn('resource/id')).toEqual(['https://universalavenue.com/resource/id?query=true', undefined]);
    expect(fn('/resource/id')).toEqual(['https://universalavenue.com/resource/id?query=true', undefined]);
  });

  it('should append query', () => {
    const fn = requestHelper()
      .appendQuery({
        auth: true,
      })
      .value();
    expect(fn('resource/id')).toEqual(['resource/id?auth=true', undefined]);
  });
  it('should overwrite on append query', () => {
    const fn = requestHelper()
      .appendQuery({
        auth: true,
      })
      .value();
    expect(fn('resource/id?auth=false')).toEqual(['resource/id?auth=true', undefined]);
  });
  it('should not overwrite on prepend query', () => {
    const fn = requestHelper()
      .prependQuery({
        auth: true,
      })
      .value();
    expect(fn('resource/id?auth=false')).toEqual(['resource/id?auth=false', undefined]);
  });
});

describe('fetch with prepareRequest', () => {
  let fetchMock;
  let fetch;
  function applyAuthToken() {
    return {
      headers: {
        authorization: 'token',
      },
    };
  }
  beforeEach(() => {
    fetchMock = jest.genMockFunction();
    fetch = fetchWrap({
      prepareRequest: req => req
        .applyToInit(applyAuthToken)
        .value(),
      fetch: fetchMock,
    });
  });
  it('should preserve request params', () => {
    fetch('/resource', { headers: { test: 5 } });
    expect(fetchMock.mock.calls[0]).toEqual(['/resource', {
      headers: {
        test: 5,
        authorization: 'token',
      },
    }]);
  });
});
