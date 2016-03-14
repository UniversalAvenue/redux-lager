import _ from 'lodash';
import u from 'updeep';
import EntitySchema from 'normalizr/lib/EntitySchema';
import IterableSchema from 'normalizr/lib/IterableSchema';

export function inflate(data, schema, selectEntity) {
  return state => {
    if (data === undefined) {
      return data;
    }
    if (schema instanceof EntitySchema) {
      const base = selectEntity(schema.getKey())(data)(state);
      const keys = _.filter(_.keys(schema), k => k.indexOf('_') !== 0);
      return _.reduce(keys, (sum, key) =>
        u({
          [key]: inflate(base[key], schema[key], selectEntity)(state),
        }, sum)
      , base);
    } else if (schema instanceof IterableSchema) {
      return data.map(id => inflate(id, schema.getItemSchema(), selectEntity)(state));
    }
    return _.reduce(schema, (sum, _schema, key) =>
      u({
        [key]: inflate(data[key], schema[key], selectEntity)(state),
      }, sum)
    , {});
  };
}
