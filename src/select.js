import _ from 'lodash';
import u from 'updeep';

export const FETCH_STATE_REQUESTED = 'requested';
export const FETCH_STATE_COMPLETED = 'completed';
export const FETCH_STATE_FAILED = 'failed';

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
  const result = _.pick(store, 'loading', 'error');
  if (result.loading) {
    return FETCH_STATE_REQUESTED;
  }
  if (result.error) {
    return FETCH_STATE_FAILED;
  }
  return FETCH_STATE_COMPLETED;
};

export const selectIsPageLoading = identifier => page => state => {
  const store = _.get(state, `lager.pagination.${identifier}.pages[${page - 1}]`);
  if (!store) {
    return false;
  }
  return store.loading;
};

function pageCoordinates(rowIndex, perPage) {
  return {
    pageId: Math.floor(rowIndex / perPage),
    pagePosition: rowIndex % perPage,
  };
}

export const selectRowGetter = (identifier, schema) => state => {
  const store = _.get(state, `lager.pagination.${identifier}`);
  if (!store) {
    return null;
  }
  return rowIndex => {
    const {
      pageId,
      pagePosition,
    } = pageCoordinates(rowIndex, store.perPage);
    const page = store.pages[pageId];
    if (!page) {
      return null;
    }
    const schemaKeys = _.keys(schema);
    if (schemaKeys.length === 1) {
      const id = _.get(page, `${schemaKeys[0]}.[${pagePosition}]`);
      if (!id) {
        return null;
      }
      return selectEntity(schemaKeys[0])(id)(state);
    }
    return _.reduce(schemaKeys, (sum, key) => {
      const id = _.get(page, `${key}.[${pagePosition}]`);
      if (!id) {
        return Object.assign(sum, {
          [key]: null,
        });
      }
      return Object.assign(sum, {
        [key]: selectEntity(key)(id)(state),
      });
    }, {});
  };
};

export const selectPageStats = (identifier) => state => {
  const store = _.get(state, `lager.pagination.${identifier}`);
  if (!store) {
    return null;
  }
  return _.omit(store, 'pages');
};

export const selectMissingPages = (identifier, eager) => state => {
  const store = _.get(state, `lager.pagination.${identifier}`);
  if (!store) {
    return null;
  }
  return (min, max) => {
    const minCoords = pageCoordinates(min, store.perPage);
    const maxCoords = pageCoordinates(max, store.perPage);
    const pad = eager ? 1 : 0;
    const maxPageId = Math.ceil(store.totalEntries / store.perPage);
    const pages = _.range(
      Math.max(minCoords.pageId - pad, 0),
      Math.min(maxCoords.pageId + pad, maxPageId) + 1
    );
    return _.filter(pages, pageId => !store.pages[pageId]);
  };
};
