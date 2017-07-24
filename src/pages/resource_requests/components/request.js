import React from 'react'
import { Panel, ListGroup, ListGroupItem, Button, InputGroup, FormControl, DropdownButton, MenuItem } from 'react-bootstrap'
import { Link } from 'react-router-dom'

var moment = require('moment');

const Request = (props) => {
    const { _id, accountName, resourceType, resourceRate, quantity, submissionDate, tentativeStartDate, fulfilmentDate, status, comments } = props.data;
    const baseUrl = props.baseUrl
    const age = -1*moment(submissionDate).diff(moment(),"days");
    return (
    <Panel header={submissionDate ? accountName.toUpperCase() + " - " + moment(submissionDate).format('MMMM Do YYYY'):accountName.toUpperCase()} bsStyle="primary">
        <ListGroup>
            <ListGroupItem>{'Position: ' + resourceType}</ListGroupItem>
            <ListGroupItem>{'Rate: ' + resourceRate}</ListGroupItem>
            <ListGroupItem>{'Quantity: ' + quantity}</ListGroupItem>
            <ListGroupItem>{'Age: ' } { age < 14 ? age + ' days ago': <span style={{color:'red'}}>{age} days ago</span>}</ListGroupItem>
            <ListGroupItem>{'Tentative Start Date: '}{ (tentativeStartDate) ? moment(tentativeStartDate).format('MMMM Do YYYY') : <span style={{color:'red'}}>TBD</span>}</ListGroupItem>
            <ListGroupItem>{'Fulfilment Date: ' }{ (fulfilmentDate) ? moment(fulfilmentDate).format('MMMM Do YYYY'): <span style={{color:'red'}}>TBD</span>}</ListGroupItem>
            <ListGroupItem>{'Status: ' + status}</ListGroupItem>
            <ListGroupItem>{'Comment:'}<br/>{ (comments && comments.length > 0 ? comments[comments.length - 1].text : '')}</ListGroupItem>
        </ListGroup>
        <Link to={`${baseUrl}/${_id}`}>
            <Button>View</Button>
        </Link>
        {" "}
        <a onClick={() => props.handleShowComment(_id)}>
            <Button>Show Comment</Button>
        </a>
        {" "}
        <Link to={{
                pathname: `${baseUrl}/${_id}`,
                state: { isDelete: true }}}>
            <Button>Delele</Button>
        </Link>
        {" "}
        <InputGroup>
            <FormControl type="text" />
            <DropdownButton componentClass={InputGroup.Button} id="input-dropdown-addon" title="Action">
                <MenuItem key="1">Add comment</MenuItem>
                <MenuItem key="1">Close with comment</MenuItem>
                <MenuItem key="1">Cancel with comment</MenuItem>
            </DropdownButton>
        </InputGroup>
    </Panel>);
}

export default Request;