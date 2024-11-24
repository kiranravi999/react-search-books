import axios from "axios";
import SuccessView from "./SuccessView";

import * as actionCreators from "../actions/actionCreators";
import "./SearchBooks.css";

import { useReducer } from "react";
import { actionTypes } from "../constants/actionTypes";
import { stateConstants } from "../constants/stateConstants";
import { ClipLoader } from "react-spinners";

const {
  onSuccess,
  onFailure,
  onProgress,
  setInputError,
  setSuggestionText,
  onChangeQuery,
  displayBar,
  pageIncrement,
  pageDecrement,
} = actionCreators;
let uniqueid = null;

const initialState = {
  view: stateConstants.initialState,
  data: [],
  error: "",
  searchQuery: "",
  suggestionBar: false,
  eventListener: true,
  suggestionText: false,
  count: 1,
  inputError: "",
};

const reducer = (state, action) => {
  switch (action.type) {
    // when the api response is in progress
    case actionTypes.ON_PROGRESS:
      return {
        ...state,
        data: [],
        view: stateConstants.inProgress,
        eventListener: true,
        suggestionBar: false,
        error: "",
      };
    // when the api response is in success
    case actionTypes.ON_SUCCESS:
      return {
        ...state,
        data: action.payload,
        view: stateConstants.success,
        suggestionBar: false,
        error: "",
      };
    // when the api response is in failure
    case actionTypes.ON_FAILURE:
      return {
        ...state,
        data: [],
        view: stateConstants.failure,
        error: action.payload,
      };
    //To update the search query
    case actionTypes.ON_CHANGE_QUERY:
      return {
        ...state,
        searchQuery: action.payload.query,
        eventListener: action.payload.eventListener,
      };
    // To display or hide the suggestion bar which give suggestions
    case actionTypes.DISPLAY_BAR:
      return {
        ...state,
        suggestionBar: action.payload.suggestionBar,
        data: action.payload.books,
        view: stateConstants.initial,
      };
    // To display or hide the suggestionText
    case actionTypes.SET_SUGGESTION_TEXT:
      return {
        ...state,
        suggestionText: action.payload,
      };
    // To increment the page value:
    case actionTypes.PAGE_INCREMENT:
      return {
        ...state,
        count: state.count + 1,
      };

    // To decrement the page value:
    case actionTypes.PAGE_DECREMENT:
      return {
        ...state,
        count: state.count - 1,
      };

    // To set the input error message
    case actionTypes.SET_INPUT_ERROR:
      return {
        ...state,
        inputError: action.payload,
      };

    default:
      return state;
  }
};

const SearchBooks = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // To render the loading state of api response
  const renderInProgressView = () => {
    return (
      <div className="text-center mt-5">
        {" "}
        <ClipLoader color="#3498db" size={50} />
      </div>
    );
  };

  // To render the success view based on the data fetched
  const renderSearchBooksSuccessView = () => <SuccessView state={state} />;

  // To render the failure view of response
  const renderSearchBooksFailureView = () => {
    const { error } = state;
    switch (error) {
      case "Network Error":
        return (
          <div className="text-center mt-5">
            <img
              className="w-75 image-style"
              src="/images/internet_error_image.png"
              alt="Network Error or incorrect url"
            />
          </div>
        );

      case "No results found":
        return (
          <div className="text-center mt-5">
            <img
              className="w-75 image-style"
              src="/images/books_not_found.png"
              alt="Books not found"
            />
          </div>
        );

      default:
        return (
          <div className="text-center mt-5">
            <img
              className="w-75 image-style"
              src="/images/something_went_wrong.png"
              alt="Something went wrong please try again"
            />
          </div>
        );

      // <div>{error}</div>;
    }
  };

  // Rendering the views based on the response
  const renderSearchBooks = () => {
    const { view } = state;
    switch (view) {
      case stateConstants.success:
        return renderSearchBooksSuccessView();
      case stateConstants.failure:
        return renderSearchBooksFailureView();
      case stateConstants.inProgress:
        return renderInProgressView();
      default:
        return null;
    }
  };

  // To fetch the response from api
  const fetchResponse = async (title = state.searchQuery) => {
     dispatch(displayBar([], false));
     if (!title){
        dispatch(setInputError("Please enter a search query"));
     }// dispatch(setInputError("")); // To hide the error message of search input
    if (title) {
      dispatch(onProgress()); // Dispatching  action on the loading state of response

      try {
        const response = await axios.get(
          `https://openlibrary.org/search.json?title=${title}`
        );
        const books = response.data.docs;
        const filteredBooks = books.filter((book) =>
          book.title.toLowerCase().includes(state.searchQuery.toLowerCase())
        );
        if (filteredBooks.length > 0) {
          dispatch(onSuccess(filteredBooks)); // Pass filtered results
        } else if (books.length > 0) {
          dispatch(onSuccess(books)); //Pass unfiltered results
        } else {
          dispatch(onFailure("No results found")); //Setting the  message when no books found
        }
      } catch (error) {
        
        dispatch(onFailure(error.message)); // Setting the message based on failure response
      }

      dispatch(setInputError("")); 
    }
  };

  // To render the suggestions based on the api call in the suggestion bar
  const renderSuggestions = async () => {
    if (state.searchQuery) {
      dispatch(setSuggestionText(true));
      const response = await axios.get(
        `https://openlibrary.org/search.json?title=${state.searchQuery}`
      ); // To display the suggestion text before showing suggestions
      const books = response.data.docs;
      const filteredBooks = books.filter((book) =>
        book.title.toLowerCase().includes(state.searchQuery.toLowerCase())
      ); //Filtering the data from api based on search query to show in the suggestion bar

      if (filteredBooks.length > 0) {
        dispatch(displayBar(filteredBooks, true)); //To display the suggestion bar for showing suggestions
      }

      dispatch(setSuggestionText(false)); // To hide the suggestion text after showing suggestions
    }
  };

  // To handle the input change when onChange event occurs
  const handleOnChange = (event) => {
    if (event.target.value.trim("") === "") {
      // If input is empty, hide suggestions
      dispatch(displayBar([], false));
    }
    //    if(event.target.value){
    dispatch(onChangeQuery({ title: event.target.value, eventListener: true })); // To update the search query
    if (event.target.value) {
      debounceFetch();
      //  }
    }
  };

  // To fetch the response after a delay based on search query and showing suggestions
  const debounceFetch = () => {
    clearTimeout(uniqueid);
    uniqueid = setTimeout(() => {
      renderSuggestions();
    }, 400);
  };

  // When clicked on suggestion handling the case
  const suggestionClicked = (title) => {
    dispatch(
      onChangeQuery({
        title,
        eventListener: false,
      })
    ); //updating the search query with the suggestion clicked and when  onchange event happens making the event listener null so the suggestions won't render:

    fetchResponse(title); // fetch the response based on the suggestion clicked
    dispatch(
      onChangeQuery({
        title: title,
        eventListener: true,
      })
    ); // After getting the response by setting the eventlistener key to true ,making onChange event listener to execute the further operations
  };

  // Handling the Onkeydown event
  const handleOnKeyDown = (event) => {
    
    if (event.key === "Enter") {
      fetchResponse();
    }

  };

  // When search button is clicked, fetching the response when there is a search query
  const handleSearch = () => {

      fetchResponse();
  };

  // To decrease the page count
  const handleDecrement = () => {
    dispatch(pageDecrement());
  };

  // To increase the page count
  const handleIncrement = () => {
    dispatch(pageIncrement());
  };

  return (
    <div className="pt-5 pb-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12">
            <div className="d-flex input-group justify-content-center">
              <input
                className="searchElement  form-control ps-3"
                value={state.searchQuery}
                onChange={state.eventListener ? handleOnChange : null}
                onKeyDown={handleOnKeyDown}
                type="search"
                placeholder="Search books..."
              />
              <button
                className="btn btn-outline-secondary input-group-append"
                onClick={handleSearch}
              >
                Search
              </button>
            </div>
            {state.inputError && <p className=" mt-1 text-danger">{state.inputError}</p>}

            {state.suggestionText && (
              <p className="mt-1">Giving Suggestions...</p>
            )}

            {state.suggestionBar && (
              <ul className="mt-2 suggestion-bar ps-2 py-2 list-unstyled">
                {state.data.map((item) => (
                  <li
                    onClick={() => suggestionClicked(item.title)}
                    key={item.key}
                    className="mb-3"
                  >
                    {item.title}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="col-12">
            {renderSearchBooks()}
            {state.view === stateConstants.success && (
              <div className="text-center fixed-bottom mb-3">
                <button
                  onClick={handleDecrement}
                  disabled={state.count === 1} // Disable when on the first page
                  className="me-2 pagination-button"
                >
                  &lt;
                </button>
                <span>Page {state.count}</span>
                <button
                  onClick={handleIncrement}
                  disabled={state.count * 10 >= state.data.length} // Disable when on the last page
                  className="ms-2 pagination-button"
                >
                  &gt;
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBooks;
