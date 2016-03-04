import u from 'updeep';
import _ from 'lodash';

import { LAGER_REQUEST, LAGER_FAILURE, LAGER_SUCCESS, LAGER_ACTION } from './middleware';

export default function paginationReducer(state = {}, action = {}) {
  const lagerType = action[LAGER_ACTION];
  if (!lagerType) {
    return state;
  }
  const {
    identifier,
    schemaKeys,
  } = action;
  const queriedPage = action.query && action.query.page || 0;
  if (!queriedPage) {
    return state;
  }
  const query = _.omit(action.query, 'page');
  switch (lagerType) {
    case LAGER_SUCCESS: {
      const {
        result,
      } = action.response;
      const {
        currentPage,
        totalEntries,
        nextPage,
      } = result;
      return u({
        [identifier]: {
          loading: false,
          pages: {
            [currentPage - 1]: {
              ..._.pick(result, schemaKeys),
              loading: false,
            },
          },
          perPage: 30,
          query,
          nextPage,
          totalEntries,
        },
      }, state);
    }
    case LAGER_REQUEST: {
      const oldQuery = state[identifier] && state[identifier].query;
      if (_.isEqual(oldQuery, query) && queriedPage > 1) {
        return u({
          [identifier]: {
            loading: true,
            pages: {
              [queriedPage - 1]: {
                loading: true,
              },
            },
          },
        }, state);
      }
      return u({
        [identifier]: {
          loading: true,
          pages: () => ({
            [queriedPage - 1]: {
              loading: true,
            },
          }),
        },
      }, state);
    }
    case LAGER_FAILURE:
      return u({
        [identifier]: {
          loading: false,
          error: true,
        },
      }, state);
    default:
      return state;
  }
}
