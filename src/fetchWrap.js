import _ from 'lodash';
import * as helpers from './requestHelpers';

export function requestHelper(...middlewares) {
  return _.reduce(helpers, (sum, helper, key) => ({
    ...sum,
    [key]: (...args) => requestHelper.apply(null, [...middlewares, helper.apply(null, args)]),
  }), {
    value: () => (...args) =>
      _.reduce(middlewares, (sum, ware) => ware.apply(null, sum), args),
  });
}

function prepareNothing(...args) {
  return args;
}

export default function fetchWrap(options, ...prepareArgs) {
  const {
    fetch,
    prepareRequest,
  } = options;
  const prep = prepareRequest ?
    prepareRequest.apply(null, [requestHelper(), ...prepareArgs]) :
    prepareNothing;
  return function fetcher(input, init) {
    return fetch.apply(null, prep(input, init));
  };
}
