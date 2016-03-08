import u from 'updeep';
import _ from 'lodash';
import url from 'url';

import { LAGER_REQUEST, LAGER_FAILURE, LAGER_SUCCESS, LAGER_ACTION } from './middleware';

export function removePageParam(str) {
  const decomp = url.parse(str, true);
  if (decomp.query) {
    delete decomp.query.page;
    delete decomp.search;
  }
  return url.format(decomp);
}

export default function paginationReducer(state = {}, action = {}) {
  const lagerType = action[LAGER_ACTION];
  if (!lagerType) {
    return state;
  }
  const {
    identifier,
    input,
    schemaKeys,
  } = action;
  const {
    query: {
      page,
    } = {},
  } = url.parse(input, true);
  if (!page) {
    return state;
  }
  const id = removePageParam(identifier);
  switch (lagerType) {
    case LAGER_SUCCESS: {
      const {
        result,
      } = action.response;
      const {
        currentPage,
        totalEntries,
        perPage,
      } = result;
      return u({
        [id]: {
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
        },
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
