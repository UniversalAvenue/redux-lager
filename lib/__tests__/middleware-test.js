'use strict';

var _normalizr = require('normalizr');

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

jest.dontMock('../middleware');
jest.dontMock('../fetch-wrap');
jest.dontMock('../request-helpers');

var middleware = require('../middleware').default;
var LAGER_FETCH = require('../middleware').LAGER_FETCH;

var response = new _normalizr.Schema('user');

describe('Middleware', function () {
  pit('should handle happy path', function () {
    var fetch = jest.genMockFn();
    fetch.mockImpl(function () {
      return new Promise(function (res) {
        return res({
          ok: true,
          json: function json() {
            return new Promise(function (_res) {
              return _res({
                response: {
                  id: 5,
                  name: 'Carl'
                }
              });
            });
          }
        });
      });
    });
    var next = jest.genMockFn();
    next.mockImpl(function (action) {
      return action;
    });
    var getState = jest.genMockFn();
    getState.mockReturnValue({
      help: 'basepath'
    });
    var _ware = middleware({
      fetch: fetch,
      prepareRequest: function prepareRequest(req, state) {
        return req.prependPath(state.help).value();
      }
    })({
      getState: getState
    });

    var REQUEST_TYPE = 'REQUEST';
    var SUCCESS_TYPE = 'SUCCESS';
    var action = _defineProperty({}, LAGER_FETCH, {
      input: 'resource/me',
      schema: { response: response },
      types: [REQUEST_TYPE, SUCCESS_TYPE, 'failure']
    });

    return _ware(next)(action).then(function (successAction) {
      expect(next.mock.calls[0][0].type).toEqual(REQUEST_TYPE);
      expect(successAction.type).toEqual(SUCCESS_TYPE);
    });
  });
  pit('should handle sad path', function () {
    var fetch = jest.genMockFn();
    fetch.mockImpl(function () {
      return new Promise(function (res) {
        return res({
          ok: false,
          error: 'Could not process request'
        });
      });
    });
    var next = jest.genMockFn();
    next.mockImpl(function (action) {
      return action;
    });
    var getState = jest.genMockFn();
    getState.mockReturnValue({
      help: 'basepath'
    });
    var _ware = middleware({
      fetch: fetch,
      prepareRequest: function prepareRequest(req, state) {
        return req.prependPath(state.help).value();
      }
    })({
      getState: getState
    });

    var REQUEST_TYPE = 'REQUEST';
    var SUCCESS_TYPE = 'SUCCESS';
    var ERROR_TYPE = 'FAILURE';
    var action = _defineProperty({}, LAGER_FETCH, {
      input: 'resource/me',
      schema: { response: response },
      types: [REQUEST_TYPE, SUCCESS_TYPE, ERROR_TYPE]
    });

    return _ware(next)(action).then(function (successAction) {
      expect(next.mock.calls[0][0].type).toEqual(REQUEST_TYPE);
      expect(successAction.type).toEqual(ERROR_TYPE);
    });
  });
});