import _ from 'lodash';
import { LAGER_FETCH, LAGER_RESET, LAGER_ACTION } from './middleware';
import { requestHelper } from './fetch-wrap';

export const ENTITIES_REQUEST = 'ENTITIES_REQUEST';
export const ENTITIES_SUCCESS = 'ENTITIES_SUCCESS';
export const ENTITIES_FAILURE = 'ENTITIES_FAILURE';

export function fetch(input, {
  identifier,
  schema,
  types = [ENTITIES_REQUEST, ENTITIES_SUCCESS, ENTITIES_FAILURE],
  ...init,
} = {}) {
  return {
    [LAGER_FETCH]: {
      input,
      init,
      identifier,
      schema,
      types,
    },
  };
}

export function reset(identifier) {
  return {
    [LAGER_ACTION]: LAGER_RESET,
    identifier,
  };
}

const methods = {
  get: 'GET',
  post: 'POST',
  put: 'PUT',
  destroy: 'DELETE',
};

function methodsReducer(sum, method, key) {
  return Object.assign(sum, {
    [key]: function fetchMethodWrapper(input, init) {
      return requestHelper(
        helper => fetch.apply(null, helper(input, init))
      ).applyToInit({ method });
    },
  });
}

_.reduce(methods, methodsReducer, fetch);
