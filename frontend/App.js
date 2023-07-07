import { Provider } from 'react-redux';
import store from './store';
import Stack from './routes/stack';

export default function App() {
  return (
    //this is redux provider
    <Provider store={store}>
      <Stack/>
    </Provider>
  );
}