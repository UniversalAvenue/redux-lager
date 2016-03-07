jest.dontMock('../actions');
jest.dontMock('../middleware');
jest.dontMock('../fetch-wrap');
jest.dontMock('../request-helpers');

const fetch = require('../actions').fetch;
const LAGER_FETCH = require('../middleware').LAGER_FETCH;

describe('Fetch action', () => {
  it('should work in basic case', () => {
    const result = fetch('/me/resource', {
      headers: {
        auth: true,
      },
    })[LAGER_FETCH];
    expect(result.init.headers.auth).toEqual(true);
  });
});

describe('Fetch get action', () => {
  it('should work in basic case', () => {
    const result = fetch
      .get('/me/resource')
      .setHeaders({
        auth: true,
      }).value()[LAGER_FETCH];
    expect(result.init.headers.auth).toEqual(true);
    expect(result.init.method).toEqual('GET');
  });
});
