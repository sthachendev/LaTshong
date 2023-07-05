const initialState = {
    token: null,
    role: null
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
      default:
        return state;
    }
  };

  export default rootReducer;