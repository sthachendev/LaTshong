const initialState = {
    token: null,
    role: null,
    unread_count: null,
  };
  
  export const setToken = (token) => {
    return {
      type: 'SET_TOKEN',
      payload: token,
    };
  };
  
  export const clearToken = () => {
    return {
      type: 'CLEAR_TOKEN',
    };
  };

  export const setRole = (role) => {
    return {
      type: 'SET_ROLE',
      payload: role,
    };
  };
  
  export const clearRole = () => {
    return {
      type: 'CLEAR_ROLE',
    };
  };

  export const setUnreadCount = (role) => {
    return {
      type: 'SET_UNREAD_COUNT',
      payload: role,
    };
  };
  
  export const clearUnreadCount = () => {
    return {
      type: 'CLEAR_UNREAD_COUNT',
    };
  };

  const rootReducer = (state = initialState, action) => {
    switch (action.type) {
      case 'SET_TOKEN':
        return { ...state, token: action.payload };
      case 'CLEAR_TOKEN':
        return { ...state, token: null };
        case 'SET_ROLE':
          return { ...state, role: action.payload };
        case 'CLEAR_ROLE':
          return { ...state, role: null };
          case 'SET_UNREAD_COUNT':
            return { ...state, unread_count: action.payload };
          case 'CLEAR_UNREAD_COUNT':
            return { ...state, unread_count: null };
      default:
        return state;
    }
  };

  export default rootReducer;