import u from 'updeep';
import _ from 'lodash';

import { LAGER_SUCCESS, LAGER_ACTION } from './middleware';

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

export default function metaReducer(state = {}, action = {}) {
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
        updatedAt: Date.now(),
      }));
      return u(updates, state);
    }
    default:
      return state;
  }
}
