import 'babel-polyfill'
import React from 'react';
import ReactDOM from 'react-dom';
import {VictoryPie, VictoryChart, VictoryTheme, VictoryBar} from 'victory';
import { Grid, Row, Col } from 'react-bootstrap'
class ReportPanel extends React.Component {
    render() {
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
        return (
            <Grid>
                <Row className='show-grid'>
                    <Col sm={6}>
                        <svg height='350px' width='570px'>
                            <g>
                                <VictoryPie theme={VictoryTheme.material} padAngle={3} innerRadius={100} data={sampleData}/>
                            </g>
                        </svg>
                    </Col>
                    <Col sm={6}>
                        <svg height='350px' width='570px'>
                            <g>
                                <VictoryChart domainPadding={20}>
                                    <VictoryBar data={sampleData}/>
                                </VictoryChart>
                            </g>
                        </svg>
                    </Col>
                </Row>
                <Row className='show-grid'>
                    <Col sm={6}>
                        <VictoryPie theme={VictoryTheme.material} data={sampleData}/>
                    </Col>
                    <Col sm={6}>
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


