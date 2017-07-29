import React from 'react'
import {VictoryPie, VictoryChart, VictoryTheme, VictoryBar, VictoryContainer} from 'victory';
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

const moment = require('moment')

class RequestStatusReport extends React.Component {

    render() {
        const rawData = this.props.data;
        const data = {
            cancel: { x: 3, y: 0, label: "Cancel" },
            open: { x: 1, y: 0, label: "Open" },
            close: { x: 2, y: 0, label: "Close" }
        };

        rawData.forEach(request => data[request.status.toLowerCase()].y = data[request.status.toLowerCase()].y + 1)
        
        if (data.open.y === 0) delete data.open;
        if (data.close.y === 0) delete data.close;
        if (data.cancel.y === 0) delete data.cancel;
        for(let i in data) {
            data[i].label = `${data[i].label} (${data[i].y})`
        }

        return (
            <div>
            <h3 className="text-center">Request Status</h3>
            {   this.props.loading && 
                <h4>"Loading....."</h4>
            }
            {   !this.props.loading &&
                <VictoryPie theme={VictoryTheme.material} padAngle={3} innerRadius={75} data={Object.keys(data).map(function(val) { return data[val] })}/>
            }
            </div>
        )
    }
}


export default RequestStatusReport
