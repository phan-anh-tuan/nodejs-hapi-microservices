import 'babel-polyfill'
import React from 'react';
import ReactDOM from 'react-dom';
import { VictoryPie, VictoryChart, VictoryTheme, VictoryBar, VictoryContainer } from 'victory';
import { Grid, Row, Col } from 'react-bootstrap'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
const moment = require('moment')

import RequestStatusReport from './request-status-report'
import RevenueLostReport from './revenue-lost-report'
import { fetchData } from '../actions/requestReport.js'

class ReportPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = { year: moment().year() };
        //console.log(`report\components\report-panel window dimension is ${window.innerWidth}`);
    }
    
    componentWillMount() {
        this.props.fetchData(this.state.year);
    }

    render() {
        console.log(`report\components\report-panel start rendering reports`)
        //const container = <VictoryContainer height={this.state.containerHeight} width={this.state.containerWidth}/>;
        return (
            <Grid>
                <Row className='show-grid' >
                    <Col sm={6} style={{height:350}}>
                       <RequestStatusReport {...this.props}/>
                    </Col>
                    <Col sm={6} style={{height:350}}>
                        <RevenueLostReport {...this.props}/>
                    </Col>
                </Row>
            </Grid>

        )
    }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchData: (year) => {
        console.log(`report/components/request-panel fetch report data with parameters year: ${year}`);
        return dispatch(fetchData(year))
    }
  }
}

const mapStateToProps = (state,ownProps) => {
  return state.requestReport;
}

export default connect(mapStateToProps,mapDispatchToProps)(ReportPanel)


