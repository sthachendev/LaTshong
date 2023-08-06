import io from 'socket.io-client';
import config from './config';

const createSocket = (token) => {
  return io(config.API_URL, {
    auth: {
      token: token, // You can set the actual token here
    },
  });
};

export default createSocket;
