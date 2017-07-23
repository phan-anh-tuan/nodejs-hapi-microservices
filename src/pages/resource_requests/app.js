import React from 'react'
import { Provider } from 'react-redux'
import { Grid, Row, Col, Nav, Navbar, NavItem } from 'react-bootstrap'
import { render } from 'react-dom'
import {
  BrowserRouter as Router,
  Route,
  Link,
  Switch,
  Redirect
} from 'react-router-dom'

import VisibleResourceRequestList from './containers/visibleResourceRequestList'
import RequestFormContainer from './containers/request_form_container'
import configureStore from './configureStore'
import NavigationBar from '../../components/navigation-bar.js'



const store = configureStore()

export default class App extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <Router>
          <Col sm={12}>
            <NavigationBar>
              <Nav>
                  <NavItem eventKey={1} href="#">About</NavItem>
                  <NavItem eventKey={2} href="#">Contact</NavItem>
                  <Navbar.Text>
                      <Link to="/resource/request/create">Create Resource Request</Link>
                  </Navbar.Text>
               </Nav>
              <Nav pullRight>
                  <NavItem eventKey={4} href="#">Sign In</NavItem>
              </Nav>
            </NavigationBar>        
            <Switch>
                  <Route path="/resource/request/:id" component={RequestFormContainer}/>
                  <Route path="/resource/request" component={VisibleResourceRequestList}/>
                  <Route exact path="/" render={ () => {
                      return (<Redirect to={{ pathname: '/resource/request' }}/>)
                  }}/>
            </Switch>
          </Col>
        </Router>
      </Provider>
    )
  }
}