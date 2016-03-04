import u from 'updeep';

import { LAGER_REQUEST, LAGER_FAILURE, LAGER_SUCCESS, LAGER_ACTION } from './middleware';

export default function resultReducer(state = {}, action = {}) {
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
}
