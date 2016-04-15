import u from 'updeep';
import _ from 'lodash';
import url from 'url';

import {
  LAGER_RESET,
  LAGER_REQUEST,
  LAGER_FAILURE,
  LAGER_SUCCESS,
  LAGER_ACTION,
} from './middleware';

export function removePageParam(str) {
  const decomp = url.parse(str, true);
  if (decomp.query) {
    delete decomp.query.page;
    delete decomp.search;
  }
  return url.format(decomp);
}

function successReducer(state, action, page) {
  const {
    schemaKeys,
  } = action;
  const {
    result,
  } = action.response;
  const {
    totalEntries,
  } = result;
  let {
    perPage,
    currentPage,
  } = result;
  if (!perPage) {
    perPage = result && _.size(result[schemaKeys[0]]);
  }
  if (!currentPage) {
    currentPage = page;
  }
  return u({
    loading: false,
    error: false,
    pages: {
      [currentPage - 1]: {
        ..._.pick(result, schemaKeys),
        loading: false,
      },
    },
    perPage,
    totalEntries,
  }, state);
}

export default function paginationReducer(state = {}, action = {}) {
  const lagerType = action[LAGER_ACTION];
  if (!lagerType) {
    return state;
  }
  const {
    identifier,
    input,
  } = action;
  const id = removePageParam(identifier);
  if (lagerType === LAGER_RESET) {
    return u({
      [identifier]: null,
    }, state);
  }
  const {
    query: {
      page,
    } = {},
  } = url.parse(input, true);
  if (!page) {
    return state;
  }
  switch (lagerType) {
    case LAGER_SUCCESS: {
      return u({
        [id]: successReducer(state[id], action, page),
      }, state);
    }
    case LAGER_REQUEST: {
      return u({
        [id]: {
          loading: true,
          pages: {
            [page - 1]: {
              loading: true,
            },
          },
        },
      }, state);
    }
    case LAGER_FAILURE:
      return u({
        [id]: {
          loading: false,
          error: true,
          pages: {
            [page - 1]: {
              loading: false,
            },
          },
        },
      }, state);
    default:
      return state;
  }
}
