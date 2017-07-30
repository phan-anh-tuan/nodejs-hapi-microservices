import 'babel-polyfill'

import React from 'react'
import { render } from 'react-dom'
import { Grid, Row } from 'react-bootstrap'
import App from './app.js'

render(
  <Grid>
    <Row className='show-grid'>
        <App />
    </Row>
  </Grid>,
  document.getElementById('root')
)