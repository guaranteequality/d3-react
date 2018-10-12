import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
// import { createStore } from 'redux';
// import reducers from './reducer';
import { Provider } from 'react-redux';

import registerServiceWorker from './registerServiceWorker';
import App from './App';
import store from './store';


// const store = createStore(reducers);

ReactDOM.render(
    <Provider store={store}>
    <App />
    </Provider>
    , document.getElementById('tool_second')
);
registerServiceWorker();
