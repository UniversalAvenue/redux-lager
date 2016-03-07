import _ from 'lodash';
import { LAGER_FETCH } from './middleware';
import { selectIsPageLoading } from './select';
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

// fetch.get('/me/resource').appendQuery

export const fetchPage = (path, schema, query) => {
  const pages = [];
  const isLoading = selectIsPageLoading(path);
  const fetchOnDefer = (dispatch, getState) => () => {
    _.uniq(pages).map(page => {
      if (!isLoading(page)(getState())) {
        dispatch(fetch(path, schema, { ...query, page }));
      }
    });
    pages.length = 0;
  };
  return page => (dispatch, getState) => {
    pages.push(page);
    _.defer(fetchOnDefer(dispatch, getState));
  };
};
