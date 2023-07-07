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

export function capitalizeWords(str) {
  return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
}

export function getTimeDifference(postDate) {
  const date = new Date(postDate);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} s ago`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} min ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} d ago`;
}

