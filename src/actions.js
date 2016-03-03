import _ from 'lodash';
import { LAGER_FETCH } from './middleware';
import { selectIsPageLoading } from './select';

export const ENTITIES_REQUEST = 'ENTITIES_REQUEST';
export const ENTITIES_SUCCESS = 'ENTITIES_SUCCESS';
export const ENTITIES_FAILURE = 'ENTITIES_FAILURE';

export const fetch = (path, schema, {
  method = 'GET',
  data,
  identifier,
  query,
}) => ({
  [LAGER_FETCH]: {
    types: [ENTITIES_REQUEST, ENTITIES_SUCCESS, ENTITIES_FAILURE],
    endpoint: path,
    schema,
    query,
    data,
    identifier,
    fetchOptions: {
      method,
    },
  },
});

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
