import * as ActionTypes from "./ActionTypes";

// The auth reducer. The starting state sets authentication
// based on a token being in local storage. In a real app,
// we would also want a util to check if the token is expired.
export const Auth = (
  state = {
    isLoading: false,
    isAuthenticated: localStorage.getItem("token") ? true : false,
    token: localStorage.getItem("token"),
    user: localStorage.getItem("userinfo")
      ? JSON.parse(localStorage.getItem("userinfo"))
      : null,
    errMess: null,
  },
  action
) => {
  switch (action.type) {
    case ActionTypes.REGISTER_REQUEST:
      return {
        ...state,
        isLoading: true,
        isAuthenticated: false,
        user: action.creds,
      };
    case ActionTypes.REGISTER_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        errMess: "",
        token: action.token,
        // user: {
        //   id: action.userinfo.id,
        //   username: action.userinfo.username,
        //   admin: action.userinfo.admin,
        //   fname: action.userinfo.firstname,
        //   lname: action.userinfo.lastname,
        // },
      };
    case ActionTypes.REGISTER_FAILURE:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        errMess: action.message,
      };
    case ActionTypes.LOGIN_REQUEST:
      return {
        ...state,
        isLoading: true,
        isAuthenticated: false,
        user: action.creds,
      };
    case ActionTypes.LOGIN_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        errMess: "",
        token: action.token,
      };
    case ActionTypes.LOGIN_FAILURE:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        errMess: action.message,
      };
    case ActionTypes.LOGOUT_REQUEST:
      return { ...state, isLoading: true, isAuthenticated: true };
    case ActionTypes.LOGOUT_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        token: "",
        user: null,
      };
    default:
      return state;
  }
};
