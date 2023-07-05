//custom fn
import jwtDecode from 'jwt-decode';

export const isTokenValid = (token) => {
  try {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000; // Convert to seconds

    // Check if the token has an expiration time (exp) and if it's still valid
    if (decodedToken.exp && decodedToken.exp > currentTime) {
      // Token is valid
      return true;
    } else {
      // Token has expired
      return false;
    }
  } catch (error) {
    // If there's an error decoding the token, it's not valid
    return false;
  }
};
