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


import store from './store'
import NavigationBar from '../../components/navigation-bar.js'
import ContactForm from './components/contact-form'


const _store = store()

export default class App extends React.Component {
  render() {
    return (
      <Provider store={_store}>
        <Router>
          <Col sm={12}>
            <NavigationBar>
              <Nav>
                  <NavItem eventKey={1} href="#">About</NavItem>
                  <li role="presentation">
                    <a href="/contact">Contact</a>
                  </li>
                  <li role="presentation">
                    <a href="/signup">Sign Up</a>
                  </li>
              </Nav>
              <Nav pullRight>
                  <li role="presentation"><a href='/signin'>Sign In</a></li>
              </Nav>
            </NavigationBar>        
            <Switch>
                <Route exact path="/contact" component={ContactForm} />
            </Switch>
          </Col>
        </Router>
      </Provider>
    )
  }
}