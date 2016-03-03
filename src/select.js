import _ from 'lodash';
import u from 'updeep';

export const selectEntities = type => ids => state => {
  const all = _.get(state, `lager.entities.${type}`);
  return _.map(ids, id => all[id]);
};

export const selectEntity = type => id => state =>
  _.get(state, `lager.entities.${type}[${id}]`);

export const selectFullEntity = (type, nestled) => id => state => {
  const entity = selectEntity(type)(id)(state);
  const nestledEntities = _.reduce(nestled, (sum, nestledType, entityAttribute) =>
    Object.assign(sum, {
      [entityAttribute]: selectEntities(nestledType)(entity[entityAttribute])(state),
    })
  , { });
  return u(nestledEntities, entity);
};


export const selectResult = (identifier, schema) => state => {
  const store = _.get(state, `lager.result.${identifier}`);
  if (!store) {
    return null;
  }
  let result = store.result;
  if (result) {
    result = _.reduce(schema, (sum, item, name) => {
      const res = result[name];
      if (_.isArray(res)) {
        return Object.assign(sum, {
          [name]: _.map(res, id => selectEntity(item._key)(id)(state)),
        });
      }
      return Object.assign(sum, {
        [name]: selectEntity(item._key)(res)(state),
      });
    }, { ...result });
  }
  return u({
    result,
  }, store);
};

export const selectFetchState = (identifier) => state => {
  const store = _.get(state, `lager.result.${identifier}`);
  if (!store) {
    return null;
  }
  return _.pick(store, 'loading', 'error');
};

export const selectIsPageLoading = endpoint => page => state => {
  const store = _.get(state, `lager.pagination.${endpoint}.pages[${page - 1}]`);
  if (!store) {
    return false;
  }
  return store.loading;
};

export const selectPagedRow = (endpoint, schema) => state => fetchPage => {
  const store = _.get(state, `lager.pagination.${endpoint}`);
  if (!store) {
    return null;
  }
  return pos => {
    const pageId = Math.floor(pos / store.perPage);
    const maxPage = Math.ceil(store.totalEntries / store.perPage);
    const inPagePos = pos % store.perPage;
    const page = store.pages[pageId];
    if (!store.pages[pageId + 1] && pageId + 2 < maxPage) {
      fetchPage(pageId + 2);
    }
    if (!page) {
      if (pageId + 1 < maxPage) {
        fetchPage(pageId + 1); // Pages aren't zero indexed
      }
      return null;
    }
    const schemaKeys = _.keys(schema);
    if (schemaKeys.length === 1) {
      const id = _.get(page, `${schemaKeys[0]}.[${inPagePos}]`);
      if (!id) {
        return null;
      }
      return selectEntity('orders')(id)(state);
    }
    return _.reduce(schemaKeys, (sum, key) => {
      const id = _.get(page, `${schemaKeys[0]}.[${inPagePos}]`);
      if (!id) {
        return Object.assign(sum, {
          [key]: null,
        });
      }
      return Object.assign(sum, {
        [key]: selectEntity('orders')(id)(state),
      });
    }, {});
  };
};

export const selectPageStats = (endpoint) => state => {
  const store = _.get(state, `lager.pagination.${endpoint}`);
  if (!store) {
    return null;
  }
  return _.omit(store, 'pages');
};
