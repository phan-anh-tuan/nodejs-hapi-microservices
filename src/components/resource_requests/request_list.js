import React from 'react';;
import {Grid, Row, Col } from 'react-bootstrap';
import Request from './request.js';


const RequestList = (props) => {
    const { items: r_requests, isFetching } = props;
    const baseUrl = props.baseUrl;
    let rows = [];
    let gridStyle = { opacity: 1 };
    r_requests.forEach((request,index) => {
        if (index % 3 === 0) {
            rows.push(<Row key={index} className='show-grid'>{[]}</Row>)
        }
        rows[rows.length-1].props.children.push(<Col sm={12} md={4} key={request._id}><Request data={request} baseUrl={baseUrl}/></Col>)
    });
    { if (isFetching) { gridStyle = {opacity: 0.5} } }
    return (
        <Grid style={gridStyle}>
            {isFetching && <Row className='show-grid'><Col sm={12}><h2>Loading.....</h2></Col></Row>}
            {rows}
        </Grid>
    )
}


export default RequestList;