import React from 'react'
import {VictoryPie, VictoryChart, VictoryTheme, VictoryBar, VictoryContainer} from 'victory';
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

const moment = require('moment')

class RequestStatusReport extends React.Component {

    render() {
        const rawData = this.props.data;
        const data = {
            open: { x: 1, y: 0, label: "Open" },
            close: { x: 2, y: 0, label: "Close" },
            cancel: { x: 3, y: 0, label: "Cancel" }
        };

        rawData.forEach(request => data[request.status.toLowerCase()].y = data[request.status.toLowerCase()].y + 1)
        data.open.label = `Open (${data.open.y})`
        data.close.label = `Close (${data.close.y})`
        data.cancel.label = `Cancel (${data.cancel.y})`
        return (
            <div>
            <h3 className="text-center">Request Status</h3>
            {   this.props.loading && 
                <h4>"Loading....."</h4>
            }
            {   !this.props.loading &&
                
                <VictoryPie theme={VictoryTheme.material} padAngle={3} innerRadius={75} data={[ data.cancel, data.open, data.close]}/>
            }
            </div>
        )
    }
}


export default RequestStatusReport
