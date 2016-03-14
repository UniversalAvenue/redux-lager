import u from 'updeep';

import {
  LAGER_RESET,
  LAGER_REQUEST,
  LAGER_FAILURE,
  LAGER_SUCCESS,
  LAGER_ACTION,
} from './middleware';

export default function resultReducer(state = {}, action = {}) {
  const lagerType = action[LAGER_ACTION];
  if (!lagerType) {
    return state;
  }
  const {
    identifier,
  } = action;

  switch (lagerType) {
    case LAGER_RESET: {
      return u({
        [identifier]: null,
      }, state);
    }
    case LAGER_SUCCESS: {
      const {
        result,
      } = action.response;
      return u({
        [identifier]: {
          loading: false,
          result,
        },
      }, state);
    }
    case LAGER_REQUEST:
      return u({
        [identifier]: {
          loading: true,
        },
      }, state);
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
