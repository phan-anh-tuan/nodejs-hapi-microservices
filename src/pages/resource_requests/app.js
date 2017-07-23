import React from 'react'
import { Provider } from 'react-redux'
import { Grid, Row, Col } from 'react-bootstrap'

import VisibleResourceRequestList from './containers/visibleResourceRequestList'
import RequestFormContainer from './containers/request_form_container'
import configureStore from './configureStore'

import { render } from 'react-dom'
import {
  BrowserRouter as Router,
  Route,
  Link,
  Switch,
  Redirect
} from 'react-router-dom'


const store = configureStore()

export default class App extends React.Component {
  render() {
    return (
      <Grid>
        <Row className='show-grid'>
          <Col sm={12}>
            <Provider store={store}>
              <Router>
                <div>
                    <Switch>
                      <Route path="/resource/request/:id" component={RequestFormContainer}/>
                      <Route path="/resource/request" component={VisibleResourceRequestList}/>
                      <Route exact path="/" render={ () => {
                          return (<Redirect to={{ pathname: '/resource/request' }}/>)
                      }}/>
                    </Switch>
                    <ul id="navigation">
                      <li><Link to="/resource/request">Resource Requests</Link></li>
                      <li><Link to="/resource/request/create">Create Resource Request</Link></li>
                    </ul>
                </div>
              </Router>
            </Provider>
          </Col>
        </Row>
      </Grid>                   
    )
  }
}