import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import dashboard from './dashboard';
import config from './config';
import pages from './pages';
import collections from './collections';
import metadata from './metadata';
import datafiles from './datafiles';
import staticfiles from './staticfiles';
import utils from './utils';
import notifications from './notifications';

export default combineReducers({
  routing: routerReducer,
  dashboard,
  config,
  pages,
  collections,
  metadata,
  datafiles,
  staticfiles,
  utils,
  notifications
});
