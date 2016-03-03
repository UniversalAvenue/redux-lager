import fetchWrap from './fetchWrap';
import _ from 'lodash';
import { normalize } from 'normalizr';
export const LAGER_FETCH = Symbol('Lager Fetch');
export const LAGER_ACTION = Symbol('Lager Action');

export const LAGER_REQUEST = 'LAGER REQUEST';
export const LAGER_SUCCESS = 'LAGER SUCCESS';
export const LAGER_FAILURE = 'LAGER FAILURE';

const buildCallApi = options => getState =>
  (
    endpoint,
    schema,
    fetchOptions = { method: 'GET' },
    query = null,
    data = null
  ) => fetchWrap(options.basePath(endpoint) + options.appendPath(endpoint))
    .set(options.fetchOptions(getState))
    .set(fetchOptions)
    .body(data)
    .query(options.query(getState))
    .query(query)
    .fetch()
    .then(response =>
      response.json()
        .then(json => ({ json, response }),
              error => ({ json: error, response }))
    ).then(({ json, response }) => {
      if (!response.ok) {
        return Promise.reject({ message: `${response.status}: ${response.statusText}` });
      }
      return normalize(json, schema);
    });

const defaultOptions = {
  fetchOptions: () => ({}),
  query: () => null,
  basePath: path => path,
  appendPath: () => '',
};

export default (options = {}) => store => {
  const callApi = buildCallApi({ ...defaultOptions, ...options })(store.getState);
  return next => action => {
    const lagerFetch = action[LAGER_FETCH];
    if (typeof lagerFetch === 'undefined') {
      return next(action);
    }

    let { endpoint, query, fetchOptions } = lagerFetch;
    const { schema, types, data, identifier } = lagerFetch;

    if (typeof endpoint === 'function') {
      endpoint = endpoint(store.getState());
    }
    if (typeof query === 'function') {
      query = query(store.getState());
    }
    if (typeof fetchOptions === 'function') {
      fetchOptions = fetchOptions(store.getState());
    }

    if (typeof endpoint !== 'string') {
      throw new Error('Specify a string endpoint URL.');
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
        endpoint,
        query,
        fetchOptions,
        schemaKeys: _.keys(schema),
        identifier,
      }, action, more);
      finalAction[LAGER_ACTION] = lagerType;
      delete finalAction[LAGER_FETCH];
      return finalAction;
    }

    const [requestType, successType, failureType] = types;
    next(actionWith({ type: requestType }, LAGER_REQUEST));

    return callApi(endpoint, schema, fetchOptions, query, data).then(
      response => next(actionWith({
        response,
        type: successType,
      }, LAGER_SUCCESS)),
      error => next(actionWith({
        type: failureType,
        error: error.message || 'Something bad happened',
      }, LAGER_FAILURE))
    );
  };
};
