import { actionTypes } from "../constants/actionTypes";

export const onSuccess = (data) => ({
  type: actionTypes.ON_SUCCESS,
  payload: data,
});

export const onFailure = (error) => ({
  type: actionTypes.ON_FAILURE,
  payload: error,
});
export const onProgress = () => ({
  type: actionTypes.ON_PROGRESS,
});

export const onChangeQuery = (query) => ({
  type: actionTypes.ON_CHANGE_QUERY,
  payload: { query: query.title, eventListener: query.eventListener },
});

export const displayBar = (books, suggestionBar) => ({
  type: actionTypes.DISPLAY_BAR,
  payload: { books, suggestionBar },
});

export const pageIncrement = () => ({
  type: actionTypes.PAGE_INCREMENT,
});

export const pageDecrement = () => ({
  type: actionTypes.PAGE_DECREMENT,
});

export const setInputError = (error) => ({
  type: actionTypes.SET_INPUT_ERROR,
  payload: error,
});

export const setSuggestionText = (suggestionText) => ({
  type: actionTypes.SET_SUGGESTION_TEXT,
  payload: suggestionText,
});
