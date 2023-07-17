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

//get in time in ago format, like in 12h ago, 1 sec ago
// example
// If the time difference is less than a minute: "30 s ago"
// If the time difference is 2 minutes: "2 min ago"
// If the time difference is 5 hours: "5 h ago"
// If the time difference is 1 day: "Yesterday at 10:30 AM"
// If the time difference is 4 days: "Monday at 5:45 PM"
// If the time difference is 10 days: "July 4, 2023 at 8:15 AM"
export function getTimeDifference(postDate) {
  const date = new Date(postDate);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) {
    if (diffInSeconds < 10) {
      return 'Just now';
    } else {
      return `${diffInSeconds} s ago`;
    }
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
  if (diffInDays === 1) {
    return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else if (diffInDays < 7) {
    const weekday = date.toLocaleDateString([], { weekday: 'long' });
    return `${weekday} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }

  const month = date.toLocaleDateString([], { month: 'long' });
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month} ${day}, ${year} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}
//yesterday /// date/month/year
export function getTimeDifference2(postDate) {
  const date = new Date(postDate);
  const now = new Date();
  const diffInMilliseconds = now - date;

  const oneDayInMilliseconds = 24 * 60 * 60 * 1000;
  const diffInDays = Math.floor(diffInMilliseconds / oneDayInMilliseconds);

  if (diffInDays === 0) {
    const diffInSeconds = Math.floor(diffInMilliseconds / 1000);

    if (diffInSeconds < 60) {
      if (diffInSeconds < 10) {
        return 'Just now';
      } else {
        return `${diffInSeconds} s ago`;
      }
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    return `${diffInHours} h ago`;
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }
}

//get in 12h format
export function getTime(postDate) {
  const date = new Date(postDate);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  let period = " am";

  if (hours >= 12) {
    period = " pm";
  }

  let formattedHours = hours % 12;
  formattedHours = formattedHours === 0 ? 12 : formattedHours;

  const formattedMinutes = minutes.toString().padStart(2, "0");
  const formattedTime = `${formattedHours}:${formattedMinutes}${period}`;

  return formattedTime;
}

export function isToday(date) {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

export function isSameDate(date1, date2) {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}

//validate user input contains not special characters //editProfile.js //signup.js
export function validateInput(input) {
  if (input === null || input === undefined) {
    // input is null or undefined
    return false;
  }

  var pattern = /^[a-zA-Z]+(?: [a-zA-Z]+)?$/;
  if (pattern.test(input)) {
    // input is valid
    console.log('valid');
    return true;
  } else {
    // input contains special characters
    console.log('invalid');
    return false;
  }
}

export function validateInputContainNumOnly(input) {
  if (input === null || input === undefined) {
    // input is null or undefined
    return false;
  }

  var pattern = /^\d+$/;
  if (pattern.test(input)) {
    // input is valid
    console.log('valid');
    return true;
  } else {
    // input contains non-numeric characters
    console.log('invalid');
    return false;
  }
}

export function validateEmail(email) {
  if (!email) {
    return false; // email is null or empty
  }
  const pattern = /^[a-zA-Z0-9]+([._]?[a-zA-Z0-9]+)*@[a-zA-Z0-9]+([.-]?[a-zA-Z0-9]+)*\.[a-zA-Z]{2,}$/;
  return pattern.test(email);
}

//cut name/ strings
export function truncateName(name, maxLength) {
  if (name.length <= maxLength) {
    return name;
  } else {
    return name.substring(0, maxLength) + "...";
  }
}
