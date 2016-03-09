import _ from 'lodash';
import u from 'updeep';
import url from 'url';

export function applyToInit(fn) {
  return (input, init) =>
    [
      input,
      u(_.isFunction(fn) ? fn(input, init) : fn, init),
    ];
}

export function applyToInput(fn) {
  return (input, init) =>
    [
      fn(input),
      init,
    ];
}

export function setHeaders(_headers) {
  return applyToInit((input, init) => {
    const headers = _.isFunction(_headers) ? _headers(input, init) : _headers;
    return {
      headers,
    };
  });
}

export const setQuery = (query) => setHeaders({ query });

export function prependPath(_prepend) {
  return applyToInput((input, init) => {
    const prepend = _.isFunction(_prepend) ? _prepend(input, init) : _prepend;
    return url.resolve(prepend, input);
  });
}

export function appendPath(_append) {
  return applyToInput((input, init) => {
    const append = _.isFunction(_append) ? _append(input, init) : _append;
    return input + append;
  });
}

export function prependQuery(_query) {
  return applyToInput((input, init) => {
    const query = _.isFunction(_query) ? _query(input, init) : _query;
    const pieces = url.parse(input, true);
    return url.format({
      ...pieces,
      query: {
        ...query,
        ...pieces.query,
      },
      search: undefined,
    });
  });
}

export function appendQuery(_query) {
  return applyToInput((input, init) => {
    const query = _.isFunction(_query) ? _query(input, init) : _query;
    const pieces = url.parse(input, true);
    return url.format({
      ...pieces,
      query: {
        ...pieces.query,
        ...query,
      },
      search: undefined,
    });
  });
}
