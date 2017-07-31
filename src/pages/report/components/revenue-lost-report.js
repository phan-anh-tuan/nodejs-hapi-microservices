import React from 'react'
import {VictoryChart, VictoryTheme, VictoryBar, VictoryContainer, VictoryAxis} from 'victory';
import PropTypes from 'prop-types'

const moment = require('moment')


class RevenueLostReport extends React.Component {
    
    
    render() {
        
        const workday_count = (start,end) => {
            //console.log(`revenue-lost-report calculating workings days between ${moment(start).format('MMMM Do YYYY')} ${moment(end).format('MMMM Do YYYY')}`)
            var first = start.clone().endOf('week'); // end of first week
            var last = end.clone().startOf('week'); // start of last week
            var days = last.diff(first,'days') * 5 / 7; // this will always multiply of 7
            var wfirst = first.day() - start.day(); // check first week
            if(start.day() == 0) --wfirst; // -1 if start with sunday 
            var wlast = end.day() - last.day(); // check last week
            if(end.day() == 6) --wlast; // -1 if end with saturday
            return Math.floor(wfirst + days + wlast); // get the total
        };

        const rawData = this.props.data;
        let data = [
            { y: 0, x: "Jan", Label:'xxx' },
            { y: 0, x: "Feb", Label:'xxx' },
            { y: 0, x: "Mar", Label:'xxx' },
            { y: 0, x: "Apr", Label:'xxx' },
            { y: 0, x: "May", Label:'xxx' },
            { y: 0, x: "Jun", Label:'xxx' },
            { y: 0, x: "Jul", Label:'xxx' },
            { y: 0, x: "Aug", Label:'xxx' },
            { y: 0, x: "Sep", Label:'xxx' },
            { y: 0, x: "Oct", Label:'xxx' },
            { y: 0, x: "Nov", Label:'xxx' },
            { y: 0, x: "Dec", Label:'xxx' },
        ];

        rawData.forEach(request => {
            const submissionDate = moment(request.submissionDate);
            const fulfilmentDate = (request.fulfilmentDate) ? moment(request.fulfilmentDate) : moment();
            
            let start = submissionDate.clone();
            //if (start.clone().add(1,'months') < fulfilmentDate) {
            if (start.month() < fulfilmentDate.month()) {
                while(start < fulfilmentDate) {
                    const end = start.endOf('month')
                    const working_days = workday_count(submissionDate, end);
                    const month = end.month()
                    data[month].y = data[month].y + (working_days * request.quantity * request.resourceRate)
                    //console.log(`revenue-lost-report end/working_days ${moment(end).format('MMMM Do YYYY')}/${working_days} quantity: ${request.quantity} rate: ${request.resourceRate} month: ${month}`)
                    start.add(1,'months');
                }
                start.subtract(1,'months')
            } 
            const working_days = workday_count(submissionDate, fulfilmentDate);
            const month = fulfilmentDate.month()
            data[month].y = data[month].y + (working_days * request.quantity * request.resourceRate)
        })

        return (
            <div>
            <h3 className="text-center">Revenue Lost</h3>
            {   this.props.loading && 
                <h4>"Loading....."</h4>
            }
            {   !this.props.loading &&
                <VictoryChart domainPadding={20}>
                     <VictoryAxis/>
                    <VictoryAxis
                        dependentAxis
                        tickFormat={(y) => (`$${y / 1000}k`)}
                    />
                    <VictoryBar data={data}  labels={(d) => { return (d.y > 0) ? `$${d.y / 1000}k` : '' }}/>
                </VictoryChart>
            }
            </div>
        )
    }
}


export default RevenueLostReport
