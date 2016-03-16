import _ from 'lodash';
import u from 'updeep';
import { createSelector } from 'reselect';
import { getEntityKeys, inflate } from './inflatr';

export const FETCH_STATE_REQUESTED = 'requested';
export const FETCH_STATE_COMPLETED = 'completed';
export const FETCH_STATE_FAILED = 'failed';

export const entitiesSelector = type => state =>
  type ? _.get(state, `lager.entities.${type}`) :
    state.lager.entities;

export const entitySelector = (type, id) => state =>
  _.get(state, `lager.entities.${type}[${id}]`);

export function inflatedEntitySelector(schema) {
  const entityTypes = getEntityKeys(schema);
  const entitySelectors = entityTypes.map(t => entitiesSelector(t));
  return createSelector(
    entitySelectors,
    (...entities) => (id, _schema = schema) => {
      const entityStore = _.zipObject(entityTypes, entities);
      const getEntity = type => _id => () => _.get(entityStore, `${type}.["${_id}"]`);
      return inflate(id, _schema, getEntity);
    }
  );
}

function append(prop) {
  if (!prop) {
    return '';
  }
  return `["${prop}"]`;
}

export const resultSelector = (identifier, property) => state =>
  _.get(
    state,
    `lager.result["${identifier}"]${append(property)}`
  );

export const fetchStateSelector = identifier => createSelector(
  resultSelector(identifier, 'loading'),
  resultSelector(identifier, 'error'),
  (loading, error) => {
    if (loading) {
      return FETCH_STATE_REQUESTED;
    }
    if (error) {
      return FETCH_STATE_FAILED;
    }
    return FETCH_STATE_COMPLETED;
  }
);

export const paginationSelector = identifier => state =>
  _.get(state, `lager.pagination["${identifier}"]`);


export const pageStatsSelector = (identifier) => createSelector(
  paginationSelector(identifier),
  store =>
    store && _.omit(store, 'pages')
);

function pageCoordinates(rowIndex, perPage) {
  return {
    pageId: Math.floor(rowIndex / perPage),
    pagePosition: rowIndex % perPage,
  };
}

export function rowGetterSelector(identifier, schema) {
  const entityTypes = getEntityKeys(schema);
  const entitySelectors = entityTypes.map(t => entitiesSelector(t));
  return createSelector(
    [
      paginationSelector(identifier),
      ...entitySelectors,
    ],
    (store, ...entities) => rowIndex => {
      if (!store) {
        return null;
      }
      const entityStore = _.zipObject(entityTypes, entities);
      const getEntity = type => id => () => _.get(entityStore, `${type}.["${id}"]`);
      const {
        pageId,
        pagePosition,
      } = pageCoordinates(rowIndex, store.perPage);
      const page = store.pages[pageId];
      if (!page) {
        return null;
      }
      const row = _.reduce(schema, (sum, sc, key) =>
        u({
          [key]: page[key] && page[key][pagePosition],
        }, sum)
      , {});
      const flatSchema = _.reduce(schema, (sum, sc, key) =>
        u({
          [key]: schema[key].getItemSchema(),
        }, sum)
      , {});
      return inflate(row, flatSchema, getEntity)();
    });
}

export const missingPagesSelector = (identifier, eager) =>
  createSelector(
    paginationSelector(identifier),
    store => (min, max) => {
      if (!store) {
        return null;
      }
      const minCoords = pageCoordinates(min, store.perPage);
      const maxCoords = pageCoordinates(max, store.perPage);
      const pad = eager ? 1 : 0;
      const maxPageId = Math.ceil(store.totalEntries / store.perPage) - 1;
      const pages = _.range(
        Math.max(minCoords.pageId - pad, 0),
        Math.min(maxCoords.pageId + pad, maxPageId) + 1
      );
      return _.filter(pages, pageId => !_.get(store, `pages[${pageId}]`));
    });
