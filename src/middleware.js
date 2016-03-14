import fetchWrap from './fetch-wrap';
import _ from 'lodash';
import { normalize } from 'normalizr';
import { camelizeKeys } from 'humps';
export const LAGER_FETCH = Symbol('Lager Fetch');
export const LAGER_ACTION = Symbol('Lager Action');

export const LAGER_REQUEST = 'LAGER REQUEST';
export const LAGER_SUCCESS = 'LAGER SUCCESS';
export const LAGER_FAILURE = 'LAGER FAILURE';

const buildCallApi = options => getState =>
  (
    input,
    schema,
    init
  ) => fetchWrap(options, getState())(input, init)
    .then(response =>
      response.json()
        .then(json => ({ json, response }),
              error => ({ error, response }))
    ).then(({ json, response, error }) => {
      if (!response.ok || error) {
        return Promise.reject({
          status: response.status,
          statusText: response.statusText,
          fetchError: error,
        });
      }
      const camelCase = camelizeKeys(json);
      return normalize(camelCase, schema);
    });

export default (options = {}) => store => {
  const callApi = buildCallApi(options)(store.getState);
  return next => action => {
    const lagerFetch = action[LAGER_FETCH];
    if (typeof lagerFetch === 'undefined') {
      return next(action);
    }

    let { input, init, identifier } = lagerFetch;
    const { schema, types } = lagerFetch;

    if (!identifier) {
      identifier = input;
    }

    let state;
    if (typeof input === 'function') {
      state = state || store.getState();
      input = input(state);
    }
    if (typeof init === 'function') {
      state = state || store.getState();
      init = init(state);
    }
    if (typeof input !== 'string') {
      throw new Error('Specify a string input URL.');
    }
    if (!schema) {
      throw new Error('Specify one of the exported Schemas.');
    }
    if (!Array.isArray(types) || types.length !== 3) {
      throw new Error('Expected an array of three action types.');
    }
    if (!types.every(type => typeof type === 'string')) {
      throw new Error('Expected action types to be strings.');
    }

    function actionWith(more, lagerType) {
      const finalAction = Object.assign({
        input,
        init,
        schemaKeys: _.keys(schema),
        identifier,
      }, action, more);
      finalAction[LAGER_ACTION] = lagerType;
      delete finalAction[LAGER_FETCH];
      return finalAction;
    }

    const [requestType, successType, failureType] = types;
    next(actionWith({ type: requestType }, LAGER_REQUEST));

    return callApi(input, schema, init).then(
      response => next(actionWith({
        response,
        type: successType,
      }, LAGER_SUCCESS)),
      error => next(actionWith({
        type: failureType,
        ...error,
      }, LAGER_FAILURE))
    );
  };
};
