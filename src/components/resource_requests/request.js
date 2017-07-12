import React from 'react'
import { Panel, ListGroup, ListGroupItem, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'

var moment = require('moment');
/**
accountName: requestDetail.accountName,
resourceType: requestDetail.resourceType,
resourceRate: requestDetail.resourceRate,
quantity: requestDetail.quantity,
submissionDate: requestDetail.submissionDate,
tentativeStartDate: requestDetail.tentativeStartDate,
fulfilmentDate: requestDetail.fulfilmentDate,
status: requestDetail.status
comments: will be persisted in xxx collection
**/
const Request = (props) => {
    let { _id, accountName, resourceType, resourceRate, quantity, submissionDate, tentativeStartDate, fulfilmentDate, status } = props.data;
    let baseUrl = props.baseUrl
    return (
    <Panel header={submissionDate ? accountName.toUpperCase() + " - " + moment(submissionDate).format('MMMM Do YYYY'):accountName.toUpperCase()} bsStyle="primary">
        <ListGroup>
            <ListGroupItem>{resourceType}</ListGroupItem>
            <ListGroupItem>{resourceRate}</ListGroupItem>
            <ListGroupItem>{quantity}</ListGroupItem>
            <ListGroupItem>{-1*moment(submissionDate).diff(moment(),"days") + " days ago"}</ListGroupItem>
            <ListGroupItem>{tentativeStartDate && moment(tentativeStartDate).format('MMMM Do YYYY')}</ListGroupItem>
            <ListGroupItem>{fulfilmentDate && moment(fulfilmentDate).format('MMMM Do YYYY')}</ListGroupItem>
            <ListGroupItem>{status}</ListGroupItem>
        </ListGroup>
        <Link to={`${baseUrl}/${_id}`}>
            <Button>View</Button>
        </Link>
    </Panel>);
}

export default Request;