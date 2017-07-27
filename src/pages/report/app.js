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
import ReportPanel from './components/report-panel'
import SearchBox from '../../components/search-box.js'
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
                  <NavItem eventKey={2} href="#">Contact</NavItem>
                  <li role="presentation"><a href='/resource/request'>Resource Request</a></li>
              </Nav>
              <Nav pullRight>
                  <li role="presentation"><SearchBox/></li>
                  <li role="presentation"><a href='/signin/signout'>Sign Out</a></li>
              </Nav>
            </NavigationBar>        
            <Switch>
                <Route exact path="/report" component={ReportPanel} />
            </Switch>
          </Col>
        </Router>
      </Provider>
    )
  }
}