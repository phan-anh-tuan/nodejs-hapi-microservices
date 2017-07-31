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
import { getCookie } from '../../components/get-cookie'
import ContactForm from './components/contact-form'


const _store = store()

export default class App extends React.Component {
  
  render() {
    /*const getCookie = function (cname) {
      var name = cname + "=";
      var decodedCookie = decodeURIComponent(document.cookie);
      var ca = decodedCookie.split(';');
      for(var i = 0; i <ca.length; i++) {
          var c = ca[i];
          while (c.charAt(0) == ' ') {
              c = c.substring(1);
          }
          if (c.indexOf(name) == 0) {
              return c.substring(name.length, c.length);
          }
      }
      return "";
    }*/
    const sid = getCookie('sid-ntrr');
    
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
                  {sid.length ===0 && <li role="presentation">
                    <a href="/signup">Sign Up</a>
                  </li>}
              </Nav>
              <Nav pullRight>
                  {sid.length ===0 && <li role="presentation"><a href='/signin'>Sign In</a></li>}
                  {sid.length > 0 &&<li role="presentation"><a href='/signin/signout'>Sign Out</a></li>}
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