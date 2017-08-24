import React from 'react'
import { Panel, ListGroup, ListGroupItem, Button, InputGroup, FormControl, DropdownButton, MenuItem } from 'react-bootstrap'
import { Link } from 'react-router-dom'

var moment = require('moment');

class Request extends React.Component {
    constructor(props) {
        super(props)
        this.handleSelect = this.handleSelect.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.state = {};
    }

    handleSelect(eventKey) {
        const { _id  } = this.props.data;
        const baseUrl  = this.props.baseUrl;
        switch(eventKey) { 
            case '1': 
                this.props.handleAddComment(_id,this.state.text)
                                            .then(() => this.setState({text: ''}))
                                            .catch((error) => {
                                                alert('components/request handleAddComment failed with error message', error.message);
                                            })
                break;
            case '2': /*close request successfully */
                this.props.handleCloseRequestWithComment(_id,this.state.text, 'Close')
                                            .then(() => this.setState({text: ''}))
                                            .catch((error) => {
                                                alert('components/request handleCloseRequestWithComment failed with error message', error.message);
                                            })
                break;            
            case '3': /*fail the request so cancel it */
                this.props.handleCloseRequestWithComment(_id,this.state.text, 'Cancel')
                                            .then(() => this.setState({text: ''}))
                                            .catch((error) => {
                                                alert('components/request handleCloseRequestWithComment failed with error message', error.message);
                                            })
                break;
                
            case '4': //show all comments
                this.props.handleShowComment(_id);
                break;
            case '5': //Edit the request
                this.props.history.push(`${baseUrl}/${_id}`)
                break;
            case '6':
                //this.props.history.location.state = { isDelete: true };
                this.props.history.push(`${baseUrl}/${_id}`,{ isDelete: true });
                break;
            default:
                alert(`${eventKey} is clicked!`)
        }
    } 
    
    handleChange(event) {
        const target = event.target;
        this.setState(Object.assign({}, this.state, { [target.id]: target.value }));
    }

    render() {
        const { _id, accountName, resourceType, resourceRate, quantity, submissionDate, tentativeStartDate, fulfilmentDate, status, comments } = this.props.data;
        const baseUrl = this.props.baseUrl
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
                <FormControl id="text" type="text" placeholder="Comment" onChange={this.handleChange} value={ this.state.text || ''}/>
                <DropdownButton componentClass={InputGroup.Button} id="input-dropdown-addon" title="Action" onSelect={(eventKey) => this.handleSelect(eventKey)}>
                    <MenuItem eventKey="1"><span className="glyphicon glyphicon-plus" aria-hidden="true">{" "}Comment</span></MenuItem>
                    <MenuItem eventKey="2"><span className="glyphicon glyphicon-ok-circle" aria-hidden="true">{" "}Close</span></MenuItem>
                    <MenuItem eventKey="3"><span className="glyphicon glyphicon-remove-circle" aria-hidden="true">{" "}Cancel</span></MenuItem>
                    <MenuItem eventKey="4"><span className="glyphicon glyphicon-eye-open" aria-hidden="true">{" "}Comments</span></MenuItem>
                    <MenuItem eventKey="5"><span className="glyphicon glyphicon-edit" aria-hidden="true">{" "}Edit</span></MenuItem>
                    <MenuItem eventKey="6"><span className="glyphicon glyphicon-trash" aria-hidden="true">{" "}Remove</span></MenuItem>
                </DropdownButton>
            </InputGroup>
        </Panel>);
    }
}
export default Request;