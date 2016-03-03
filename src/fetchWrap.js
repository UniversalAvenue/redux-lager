require('whatwg-fetch');
const fetch = window.fetch;

import _ from 'lodash';
import Qs from 'qs';

export function throwOnFailure(res) {
  if (!res.ok) {
    throw new Error(res.statusText);
  }
  return res;
}

export default (input, withFetch = fetch) => {
  let _query = null;
  const _authQuery = {};
  const init = {
  };
  const wrapped = {
    set: (opts) => {
      _.merge(init, opts);
      return wrapped;
    },
    query: (query) => {
      if (!query) {
        return wrapped;
      }
      _query = query;
      return wrapped;
    },
    body: (json) => {
      _.assign(init, {
        headers: _.assign(init.headers || {}, {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify(json),
      });
      return wrapped;
    },
    fetch: () => {
      let append = Qs.stringify(_.assign({}, _query, _authQuery));
      if (append) {
        append = `?${append}`;
      }
      const path = input + append;
      return withFetch(path, init);
    },
  };
  return wrapped;
};
