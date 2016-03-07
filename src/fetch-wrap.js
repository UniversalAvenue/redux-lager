import _ from 'lodash';
import * as helpers from './request-helpers';

export function requestHelper(map, ...middlewares) {
  return _.reduce(helpers, (sum, helper, key) => ({
    ...sum,
    [key]: (...args) => requestHelper.apply(null, [map, ...middlewares, helper.apply(null, args)]),
  }), {
    value: () => map((...args) =>
      _.reduce(middlewares, (sum, ware) => ware.apply(null, sum), args)
    ),
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
    prepareRequest.apply(null, [requestHelper(id => id), ...prepareArgs]) :
    prepareNothing;
  return function fetcher(input, init) {
    return fetch.apply(null, prep(input, init));
  };
}
