import { Schema } from 'normalizr';
jest.dontMock('../middleware');
jest.dontMock('../fetchWrap');
jest.dontMock('../requestHelpers');

const middleware = require('../middleware').default;
const LAGER_FETCH = require('../middleware').LAGER_FETCH;

const response = new Schema('user');

describe('Middleware', () => {
  pit('should use accept options', () => {
    const fetch = jest.genMockFn();
    fetch.mockImpl(() => new Promise((res) =>
      res({
        ok: true,
        json: () => new Promise(_res => _res({
          response: {
            id: 5,
            name: 'Carl',
          },
        })),
      })
    ));
    const next = jest.genMockFn();
    next.mockImpl((action) => action);
    const getState = jest.genMockFn();
    getState.mockReturnValue({
      help: 'basepath',
    });
    const _ware = middleware({
      fetch,
      prepareRequest: (req, state) => req.prependPath(state.help)
        .value(),
    })({
      getState,
    });


    const REQUEST_TYPE = 'REQUEST';
    const SUCCESS_TYPE = 'SUCCESS';
    const action = {
      [LAGER_FETCH]: {
        input: 'resource/me',
        schema: { response },
        types: [REQUEST_TYPE, SUCCESS_TYPE, 'failure'],
      },
    };

    return _ware(next)(action)
      .then((successAction) => {
        expect(next.mock.calls[0][0].type).toEqual(REQUEST_TYPE);
        expect(successAction.type).toEqual(SUCCESS_TYPE);
      });
  });
});
