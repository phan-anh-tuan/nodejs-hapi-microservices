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
        <InputGroup>
            <FormControl type="text" placeholder="Comment"/>
            <DropdownButton componentClass={InputGroup.Button} id="input-dropdown-addon" title="Action">
                <MenuItem key="1"><span className="glyphicon glyphicon-plus" aria-hidden="true">{" "}Comment</span></MenuItem>
                <MenuItem key="2"><span className="glyphicon glyphicon-ok-circle" aria-hidden="true">{" "}Close</span></MenuItem>
                <MenuItem key="3"><span className="glyphicon glyphicon-remove-circle" aria-hidden="true">{" "}Cancel</span></MenuItem>
                <MenuItem key="4"><span className="glyphicon glyphicon-eye-open" aria-hidden="true">{" "}Comments</span></MenuItem>
                <MenuItem key="5"><span className="glyphicon glyphicon-edit" aria-hidden="true">{" "}Edit</span></MenuItem>
                <MenuItem key="6"><span className="glyphicon glyphicon-trash" aria-hidden="true">{" "}Remove</span></MenuItem>
            </DropdownButton>
        </InputGroup>
        <Link to={`${baseUrl}/${_id}`}>
            <Button>Edit</Button>
        </Link>
        {" "}
        <a onClick={() => props.handleShowComment(_id)}>
            <Button>Show Comments</Button>
        </a>
        {" "}
        <Link to={{
                pathname: `${baseUrl}/${_id}`,
                state: { isDelete: true }}}>
            <Button>Delele</Button>
        </Link>
        {" "}
        
    </Panel>);
}

export default Request;