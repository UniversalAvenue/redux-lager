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

export function prependPath(prepend) {
  return applyToInput(input => url.resolve(prepend, input));
}

export function appendPath(append) {
  return applyToInput(input => url.resolve(input, append));
}

export function prependQuery(query) {
  return applyToInput(input => {
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

export function appendQuery(query) {
  return applyToInput(input => {
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
