import React from 'react';
import { Form, FormGroup, FormControl, Col, ControlLabel, Button, HelpBlock } from 'react-bootstrap'
import PropTypes from 'prop-types'
import { Prompt } from 'react-router-dom'
var moment = require('moment');

const FieldGroup = ({ id, label, help, children, ...rests }) => {
        return (
            <FormGroup controlId={id}>
                <Col componentClass={ControlLabel} xsPush={1} xs={11} sm={2}>
                    {label}
                </Col>
                <Col xsPush={1} xs={11} sm={6}>
                    <FormControl {...rests}>
                        {children}
                    </FormControl>
                    {help && <HelpBlock>{help}</HelpBlock>}
                </Col>
            </FormGroup>
        );
}

class ResourceRequestForm extends React.Component {
    
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.state = { isBlocking: false }
    }
    componentWillReceiveProps(nextProps) {
        //need to reset date
        if (nextProps.id === 'create' && !!nextProps.data._id) {
            //console.log(`request_form: componentWillReceiveProps - resetting data`);    
            this.props.fetchResourceRequest(nextProps.id);      
        }
        //console.log(`request_form: componentWillReceiveProps ${JSON.stringify(nextProps)}`);
    }

    componentWillMount() {
      //load the resource request by ID
      //console.log(`request_form: componentWillMount`);
      this.props.fetchResourceRequest(this.props.id);
    }
    
    shouldComponentUpdate(nextProps, nextState){
        if (nextProps.id === 'create' && !!nextProps.data._id) {
            //console.log(`request_form: shouldComponentUpdate - resetting data, no re-rendering please`);
            return false;
        }
        return true;
    }

    handleChange(event) {
        this.setState({ isBlocking: true });
        this.props.handleChange(event);
    }
    
    handleSubmit(e) {
        this.setState({ isBlocking: false });
        const isDelete = (this.props.location.state && this.props.location.state.isDelete) ? true : false;
        this.props.handleSubmit(isDelete).then( () => {  
                                                    //console.log(`request_form handleSubmit succeed`);
                                                    this.props.history.push('/resource/request');
                                                })
                                .catch((error) => {
                                                    console.log('request_form handleSubmit fail with error message', error.message);
                                                })
        e.preventDefault();
    }

    render() {
        const { isBlocking } = this.state
        const isDisabled = (this.props.location.state && this.props.location.state.isDelete) ? true: false;
        let { accountName, resourceType, resourceRate, quantity, submissionDate, tentativeStartDate, fulfilmentDate, status } = this.props.data;
        const button = this.props.id !== 'create'? 'Update' : 'Create New';
        return (
            
            <Form horizontal>
                 <Prompt
                    when={isBlocking}
                    message={location => (
                    `Are you sure you want to go to ${location.pathname}`)}/>
                { 
                    this.props.isSubmitting && 
                    <FormGroup>
                        <Col componentClass={ControlLabel} xsPush={1} xs={11} sm={2}>
                            {" "}
                        </Col>
                        <Col xsPush={1} xs={11} sm={6}>
                            <HelpBlock>{"Processing...."}</HelpBlock>
                        </Col>
                    </FormGroup>
                }
                { 
                    (this.props.location.state && this.props.location.state.isDelete) && 
                    <FormGroup>
                        <Col componentClass={ControlLabel} xsPush={1} xs={11} sm={2}>
                            {" "}
                        </Col>
                        <Col xsPush={1} xs={11} sm={6}>
                            <HelpBlock>{"Are you sure you want to delete the below request?"}</HelpBlock>
                        </Col>
                    </FormGroup>
                }
                <FieldGroup id="accountName" label="Account Name:" type="text" placeholder="Account Name" disabled={isDisabled} onChange={this.handleChange} value={!!accountName ? accountName: ''}/>
                
                <FieldGroup id="resourceType" label="Resource Type:" type="text" placeholder="Resource Type" disabled={isDisabled} onChange={this.handleChange} value={!!resourceType ? resourceType: ''}/>
                
                <FieldGroup id="resourceRate" label="Resource Rate:" type="text" placeholder="Resource Rate" disabled={isDisabled} onChange={this.handleChange} value={!!resourceRate ? resourceRate: 0}/>
                
                <FieldGroup id="quantity" label="Resource Quantity:" type="text" placeholder="Resource Quantity" disabled={isDisabled} onChange={this.handleChange} value={!!quantity ? quantity: 0}/>

                <FieldGroup id="submissionDate" label="Submission Date:" type="date" placeholder="Submission Date" disabled={isDisabled} onChange={this.handleChange} value={!!submissionDate ? moment(submissionDate).format("YYYY-MM-DD") : ''}/>

                <FieldGroup id="tentativeStartDate" label="Start Date:" type="date" placeholder="Tentative Start Date" disabled={isDisabled} onChange={this.handleChange} value={!!tentativeStartDate ? moment(tentativeStartDate).format("YYYY-MM-DD") : ''}/>

                <FieldGroup id="fulfilmentDate" label="Fulfilment Date:" type="date" placeholder="Fulfilment Date" disabled={isDisabled} onChange={this.handleChange} value={!!fulfilmentDate ? moment(fulfilmentDate).format("YYYY-MM-DD") : ''}/>

                <FieldGroup id="status" label="Status:" componentClass="select" placeholder="Status" disabled={isDisabled} onChange={this.handleChange} value={!!status ? status : 'Open'}>
                    <option value="Open">Open</option>
                    <option value="Close">Close</option>
                </FieldGroup>
                <FormGroup>
                    <Col xsPush={1} xs={11} smOffset={2} sm={6}>
                        <Button onClick={this.props.history.goBack}>
                            Back
                        </Button>
                        {" "}
                        <Button type="submit" onClick={this.handleSubmit}>
                            { (this.props.location.state && this.props.location.state.isDelete) ? 'Delete' : button }
                        </Button>
                    </Col>
                </FormGroup>
            </Form>
        )
    }
}

ResourceRequestForm.propTypes = {
    id: PropTypes.string,
    data: PropTypes.object.isRequired,
    isFetching: PropTypes.bool.isRequired,
    isSubmitting: PropTypes.bool,
    fetchResourceRequest: PropTypes.func.isRequired,
    handleChange: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired
}

export default ResourceRequestForm;