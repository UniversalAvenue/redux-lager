import u from 'updeep';

import { LAGER_SUCCESS, LAGER_ACTION } from './middleware';

export default function entitiesReducer(state = {}, action = {}) {
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
}
