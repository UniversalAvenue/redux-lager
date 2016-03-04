import { combineReducers } from 'redux';

import meta from './meta-reducer';
import entities from './entities-reducer';
import result from './result-reducer';
import pagination from './pagination-reducer';


export default combineReducers({
  meta,
  entities,
  result,
  pagination,
});
