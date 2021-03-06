import React from 'react'
import { Provider } from 'react-redux'
import { Grid, Row, Col, Nav, Navbar, NavItem, Button } from 'react-bootstrap'
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
import SearchBox from '../../components/search-box.js'


const store = configureStore()

export default class App extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <Router>
          <Col sm={12}>
            <NavigationBar showSearchBox={true}>
              <Nav onSelect={ (eventKey) => console.log(`resource_requests/app eventKey is clicked`)}>
                  <NavItem eventKey={1} href="#">About</NavItem>
                  <li role="presentation">
                    <a href="/contact">Contact</a>
                  </li>
                  <li role="presentation">
                    <Link to="/resource/request/create" style={{'backgroundColor':'#337ab7', 'borderColor':'#2e6da4', 'color':'#fff'}}>
                        Create
                    </Link>
                  </li>
                  <li role="presentation"><a href='/report'>Report</a></li>
                  <li role="presentation"><a href='/chat'>IM</a></li>
               </Nav>
              <Nav pullRight>
                  <li role="presentation"><SearchBox/></li>
                  <li role="presentation"><a href='/signin/signout'>Sign Out</a></li>
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