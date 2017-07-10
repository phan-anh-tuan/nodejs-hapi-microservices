import React from 'react'
import { Provider } from 'react-redux'
import configureStore from '../actions/configureStore'
import AsyncApp from './Reddit/asyncApp'
import VisibleResourceRequestList from './resource_requests/visibleResourceRequestList'
import RequestFormContainer from './resource_requests/request_form_container'
import { render } from 'react-dom'
import {
  BrowserRouter as Router,
  Route,
  Link,
  Switch,
  Redirect
} from 'react-router-dom'
import App from './Todos/app'
import {VisibilityFilters} from '../actions/Todos/actionTypes'




const store = configureStore()

export default class Root extends React.Component {
  render() {
    return (
      <Provider store={store}>
         <Router>
          <div>
              <Switch>
                <Route path="/reddit" component={AsyncApp}/>

                <Route path="/resource/request/:id" component={RequestFormContainer}/>
                <Route path="/resource/request" component={VisibleResourceRequestList}/>
                <Route path="/todos/:filter?" component={App}/>
                <Route exact path="/" render={ () => {
                    return (<Redirect to={{ pathname: '/resource/request' }}/>)
                }}/>
              </Switch>
              <ul id="navigation">
                <li><Link to="/todos">Todos</Link></li>
                <li><Link to="/reddit">Reddit</Link></li>
                <li><Link to="/resource/request">Resource Requests</Link></li>
                <li><Link to="/resource/request/create">Create Resource Request</Link></li>
              </ul>
          </div>
        </Router>
      </Provider>
    )
  }
}