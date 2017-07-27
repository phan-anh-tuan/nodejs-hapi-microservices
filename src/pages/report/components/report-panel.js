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
            { x: 1, y: 2, label: "one" },
            { x: 2, y: 3, label: "two" },
            { x: 3, y: 5, label: "three" },
            { x: 4, y: 5, label: "three" },
            { x: 5, y: 5, label: "three" },
            { x: 6, y: 5, label: "three" },
            { x: 7, y: 5, label: "three" },
            { x: 8, y: 5, label: "three" },
            { x: 9, y: 5, label: "three" },
            { x: 10, y: 5, label: "three" },
            { x: 11, y: 5, label: "three" },
            { x: 12, y: 5, label: "three" }
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
                            <VictoryBar data={sampleData}/>
                        </VictoryChart>
                    </Col>
                </Row>
                <Row className='show-grid'>
                    <Col sm={6} style={{height:300}}>
                        <VictoryPie theme={VictoryTheme.material} padAngle={3} innerRadius={100} data={sampleData}/>
                    </Col>
                    <Col sm={6} style={{height:300}}>
                        <VictoryChart domainPadding={20}>
                            <VictoryBar data={sampleData}/>
                        </VictoryChart>
                     </Col>
                </Row>
            </Grid>

        )
    }
}

export default ReportPanel


