
/****** Todo App bootstrap ********/
/*
import React from 'react'
import { render } from 'react-dom'
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import todoApp from './actions/combineReducers'
import App from './components/app'
import {VisibilityFilters} from './actions/actionTypes';
import { createLogger } from 'redux-logger';

const loggerMiddleware = createLogger();

const initialState = {
    todos: [],
    isFetchingTodos: false,
    visibilityFilters: VisibilityFilters.SHOW_ALL
}

let store = createStore(todoApp,
                        initialState,
                        applyMiddleware(thunkMiddleware,
                                        loggerMiddleware))

render(
  <Provider store={store}>
    <Router>
        <div>
            <Route path="/:filter?" component={App}/>
        </div>
      </Router>
  </Provider>,
  document.getElementById('root')
)
*/
/****** End Todo App bootstrap ********/

/****** Reddit App bootstrap********/

import 'babel-polyfill'

import React from 'react'
import { render } from 'react-dom'
import App from './app.js'

render(
  <App />,
  document.getElementById('root')
)

/****** End Reddit bootstrap********/