import _ from 'underscore';
import { CLEAR_ERRORS, validationError } from './utils';
import { get, put } from '../utils/fetch';
import { validator } from '../utils/validation';
import { slugify, trimObject } from '../utils/helpers';
import {
  getTitleRequiredMessage,
  getFilenameNotValidMessage,
} from '../constants/lang';
import { pagesAPIUrl, pageAPIUrl } from '../constants/api';

// Action Types
export const FETCH_PAGES_REQUEST = 'FETCH_PAGES_REQUEST';
export const FETCH_PAGES_SUCCESS = 'FETCH_PAGES_SUCCESS';
export const FETCH_PAGES_FAILURE = 'FETCH_PAGES_FAILURE';
export const FETCH_PAGE_REQUEST = 'FETCH_PAGE_REQUEST';
export const FETCH_PAGE_SUCCESS = 'FETCH_PAGE_SUCCESS';
export const FETCH_PAGE_FAILURE = 'FETCH_PAGE_FAILURE';
export const PUT_PAGE_REQUEST = 'PUT_PAGE_REQUEST';
export const PUT_PAGE_SUCCESS = 'PUT_PAGE_SUCCESS';
export const PUT_PAGE_FAILURE = 'PUT_PAGE_FAILURE';
export const DELETE_PAGE_REQUEST = 'DELETE_PAGE_REQUEST';
export const DELETE_PAGE_SUCCESS = 'DELETE_PAGE_SUCCESS';
export const DELETE_PAGE_FAILURE = 'DELETE_PAGE_FAILURE';

// Actions
export const fetchPages = (directory = '') => dispatch => {
  dispatch({ type: FETCH_PAGES_REQUEST });
  return get(
    pagesAPIUrl(directory),
    { type: FETCH_PAGES_SUCCESS, name: 'pages' },
    { type: FETCH_PAGES_FAILURE, name: 'error' },
    dispatch
  );
};

export const fetchPage = (directory, filename) => dispatch => {
  dispatch({ type: FETCH_PAGE_REQUEST });
  return get(
    pageAPIUrl(directory, filename),
    { type: FETCH_PAGE_SUCCESS, name: 'page' },
    { type: FETCH_PAGE_FAILURE, name: 'error' },
    dispatch
  );
};

export const putPage = (mode, directory, filename = '') => (
  dispatch,
  getState
) => {
  // get edited fields from metadata state
  const metadata = getState().metadata.metadata;
  let { path, raw_content, title } = metadata;

  // if path is not given or equals to directory, generate filename from the title
  if (!path && title) {
    path = `${slugify(title)}.md`;
  } else if (!path && !title) {
    return dispatch(validationError(validatePage(metadata)));
  }
  // clear errors
  dispatch({ type: CLEAR_ERRORS });

  // omit raw_content, path and empty-value keys in metadata state from front_matter
  const front_matter = _.omit(metadata, (value, key, object) => {
    return key == 'raw_content' || key == 'path' || value === '';
  });

  let payload;
  if (mode == 'create') {
    filename = path;
    payload = { front_matter, raw_content };
  } else {
    payload = { path: path, front_matter, raw_content };
  }

  //send the put request
  return put(
    pageAPIUrl(directory, filename),
    preparePayload(payload),
    { type: PUT_PAGE_SUCCESS, name: 'page' },
    { type: PUT_PAGE_FAILURE, name: 'error' },
    dispatch
  );
};

export const deletePage = (directory, filename) => dispatch => {
  return fetch(pageAPIUrl(directory, filename), {
    method: 'DELETE',
  })
    .then(data => {
      dispatch({ type: DELETE_PAGE_SUCCESS });
      dispatch(fetchPages(directory));
    })
    .catch(error =>
      dispatch({
        type: DELETE_PAGE_FAILURE,
        error,
      })
    );
};

const validatePage = metadata => {
  return validator(
    metadata,
    { path: 'required|filename' },
    {
      'path.required': getTitleRequiredMessage(),
      'path.filename': getFilenameNotValidMessage(),
    }
  );
};

const preparePayload = obj => JSON.stringify(trimObject(obj));

// Reducer
export default function pages(
  state = {
    pages: [],
    page: {},
    isFetching: false,
    updated: false,
  },
  action
) {
  switch (action.type) {
    case FETCH_PAGES_REQUEST:
    case FETCH_PAGE_REQUEST:
      return { ...state, isFetching: true };
    case FETCH_PAGES_SUCCESS:
      return { ...state, pages: action.pages, isFetching: false, page: {} };
    case FETCH_PAGES_FAILURE:
      return { ...state, isFetching: false, pages: [] };
    case FETCH_PAGE_SUCCESS:
      return { ...state, page: action.page, isFetching: false };
    case FETCH_PAGE_FAILURE:
      return { ...state, page: {}, isFetching: false };
    case PUT_PAGE_SUCCESS:
      return { ...state, page: action.page, updated: true };
    default:
      return { ...state, updated: false };
  }
}

// Selectors
export const filterBySearchInput = (list, input) => {
  if (input) {
    return list.filter(p => p.name.toLowerCase().includes(input.toLowerCase()));
  }
  return list;
};
