import React from 'react'
import { Provider } from 'react-redux'
import configureStore from '../../actions/Reddit/configureStore'
import AsyncApp from './asyncApp'
import { render } from 'react-dom'
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'
import App from '../../components/app'
import {VisibilityFilters} from '../../actions/actionTypes'

const initialState = {
    postsBySubreddit: {
        reactjs: {
            isFetching: false,
            didInvalidate: true,
            items: []
        },
        frontend: {
            isFetching: false,
            didInvalidate: true,
            items: []
        }
    },
    selectedSubreddit: 'reactjs',
    todos: [],
    isFetchingTodos: false,
    visibilityFilters: VisibilityFilters.SHOW_ALL
}

const store = configureStore(initialState)

export default class Root extends React.Component {
  render() {
    return (
      <Provider store={store}>
         <Router>
          <div>
              <Route exact path="/reddit" component={AsyncApp}/>
              <Route path="/:filter?" component={App}/>
          </div>
        </Router>
      </Provider>
    )
  }
}