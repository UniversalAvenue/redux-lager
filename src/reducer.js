import u from 'updeep';
import _ from 'lodash';
import { combineReducers } from 'redux';

import { LAGER_REQUEST, LAGER_FAILURE, LAGER_SUCCESS, LAGER_ACTION } from './middleware';

const entityMap = entities => iterator =>
  _.reduce(entities, (sum, entity, type) =>
    Object.assign(sum, {
      [type]: _.reduce(entity, (_sum, item, id) =>
        Object.assign(_sum, {
          [id]: iterator(item, id, type),
        })
      , {}),
    })
  , {});

const metaReducer = (state = {}, action = {}) => {
  const lagerType = action[LAGER_ACTION];
  if (!lagerType) {
    return state;
  }
  switch (lagerType) {
    case LAGER_SUCCESS: {
      const {
        entities,
      } = action.response;
      const updates = entityMap(entities)(() => ({
        stale: false,
        updatedAt: Date.now(),
      }));
      return u(updates, state);
    }
    default:
      return state;
  }
};

const resultReducer = (state = {}, action = {}) => {
  const lagerType = action[LAGER_ACTION];
  if (!lagerType) {
    return state;
  }
  const {
    endpoint,
    identifier,
  } = action;

  const id = identifier || endpoint;
  switch (lagerType) {
    case LAGER_SUCCESS: {
      const {
        result,
      } = action.response;
      return u({
        [id]: {
          loading: false,
          result,
        },
      }, state);
    }
    case LAGER_REQUEST:
      return u({
        [id]: {
          loading: true,
        },
      }, state);
    case LAGER_FAILURE:
      return u({
        [id]: {
          loading: false,
          error: true,
        },
      }, state);
    default:
      return state;
  }
};

const paginationReducer = (state = {}, action = {}) => {
  const lagerType = action[LAGER_ACTION];
  if (!lagerType) {
    return state;
  }
  const {
    identifier,
    endpoint,
    schemaKeys,
  } = action;
  const id = identifier || endpoint;
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
        [id]: {
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
      const oldQuery = state[id] && state[id].query;
      if (_.isEqual(oldQuery, query) && queriedPage > 1) {
        return u({
          [id]: {
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
        [id]: {
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
        [id]: {
          loading: false,
          error: true,
        },
      }, state);
    default:
      return state;
  }
};

const entitiesReducer = (state = {}, action = {}) => {
  const lagerType = action[LAGER_ACTION];
  if (!lagerType) {
    return state;
  }
  switch (lagerType) {
    case LAGER_SUCCESS: {
      const {
        entities,
      } = action.response;
      return u(entities, state);
    }
    default:
      return state;
  }
};

export default combineReducers({
  meta: metaReducer,
  entities: entitiesReducer,
  result: resultReducer,
  pagination: paginationReducer,
});
