import 'babel-polyfill'
import React from 'react';
import ReactDOM from 'react-dom';
import {VictoryPie, VictoryChart, VictoryTheme, VictoryBar, VictoryContainer} from 'victory';
import { Grid, Row, Col } from 'react-bootstrap'
class ReportPanel extends React.Component {
    constructor(props) {
        super(props);
        const containerWidth = (window.innerWidth / 3 < 300) ? window.innerWidth: (window.innerWidth / 3);
        this.state = { containerWidth: containerWidth, containerHeight: 300 };
        console.log(`report\components\report-panel window dimension is ${window.innerWidth}`);
    }
    render() {
        console.log(`report\components\report-panel start rendering reports`)
        const sampleData = [
            { x: 1, y: 2, label: "Pending" },
            { x: 2, y: 3, label: "Close" },
            { x: 3, y: 5, label: "Cancel" }
        ];

        const sampleData2 = [
            { x: 'Jan', y: 40000 },
            { x: 'Feb', y: 45000 },
            { x: 'Mar', y: 30000 },
            { x: 'Apr', y: 23000 },
            { x: 'May', y: 38000 },
            { x: 'Jun', y: 16000 },
            { x: 'Jul', y: 21000 },
            { x: 'Aug', y: 7000 },
            { x: 'Sep', y: 11000 },
            { x: 'Oct', y: 12500 },
            { x: 'Nov', y: 34000 },
            { x: 'Dev', y: 23000 }
        ];
        //const container = <VictoryContainer height={this.state.containerHeight} width={this.state.containerWidth}/>;
        return (
            <Grid>
                <Row className='show-grid' >
                    <Col sm={6} style={{height:300}}>
                       <VictoryPie theme={VictoryTheme.material} padAngle={3} innerRadius={100} data={sampleData}/>
                    </Col>
                    <Col sm={6} style={{height:300}}>
                        <VictoryChart domainPadding={20}>
                            <VictoryBar data={sampleData2}/>
                        </VictoryChart>
                    </Col>
                </Row>
                <Row className='show-grid'>
                        <VictoryChart domainPadding={20}>
                            <VictoryBar data={sampleData2}/>
                        </VictoryChart>
                </Row>
            </Grid>

        )
    }
}

export default ReportPanel


