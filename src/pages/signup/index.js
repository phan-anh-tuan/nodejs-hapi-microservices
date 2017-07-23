import 'babel-polyfill'

import React from 'react'
import { render } from 'react-dom'
import { Grid, Row, Col, Nav, NavItem } from 'react-bootstrap'
import SignUpPage from './sign-up'
import NavigationBar from '../../../src/components/navigation-bar.js'

render(
  <Grid>
    <Row className='show-grid'>
      <Col sm={12}>
        <NavigationBar>
          <Nav>
              <NavItem eventKey={1} href="#">About</NavItem>
              <NavItem eventKey={2} href="#">Contact</NavItem>
          </Nav>
          <Nav pullRight>
              <NavItem eventKey={4} href="#">Sign In</NavItem>
          </Nav>
        </NavigationBar>        
        <SignUpPage />
      </Col>
    </Row>
  </Grid>,
  document.getElementById('root')
)