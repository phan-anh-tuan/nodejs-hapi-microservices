import React from 'react';
import { Form, FormGroup, FormControl, Col, ControlLabel, Button } from 'react-bootstrap';
import PropTypes from 'prop-types'
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
    componentWillReceiveProps(nextProps) {
      console.log(`request_form: componentWillReceiveProps ${JSON.stringify(nextProps)}`);  
    }

    componentWillMount() {
      //load the resource request by ID
      console.log(`request_form: componentWillMount`);
      this.props.fetchResourceRequest(this.props.id);
    }

    render() {
        //console.log(JSON.stringify(this.props));
        let { accountName, resourceType, resourceRate, quantity, submissionDate, tentativeStartDate, fulfilmentDate, status } = this.props.data;
        const button = this.props.data._id ? 'Update' : 'Create New';
        return (
            <Form horizontal>
                <FieldGroup id="accountName" label="Account Name:" type="text" placeholder="Account Name" value={accountName}/>
                
                <FieldGroup id="resourceType" label="Resource Type:" type="text" placeholder="Resource Type" value={resourceType}/>
                
                <FieldGroup id="resourceRate" label="Resource Rate:" type="text" placeholder="Resource Rate" value={resourceRate}/>
                
                <FieldGroup id="quantity" label="Resource Quantity:" type="text" placeholder="Resource Quantity" value={quantity}/>

                <FieldGroup id="submissionDate" label="Submission Date:" type="date" placeholder="Submission Date" value={submissionDate && moment(submissionDate).format("YYYY-MM-DD")}/>

                <FieldGroup id="tentativeStartDate" label="Start Date:" type="date" placeholder="Tentative Start Date" value={tentativeStartDate && moment(tentativeStartDate).format("YYYY-MM-DD")}/>

                <FieldGroup id="fulfilmentDate" label="Fulfilment Date:" type="date" placeholder="Fulfilment Date" value={fulfilmentDate && moment(fulfilmentDate).format("YYYY-MM-DD")}/>

                <FieldGroup id="fulfilmentDate" label="Fulfilment Date:" componentClass="select" placeholder="Fulfilment Date" value={status}>
                    <option value="Open">Open</option>
                    <option value="Close">Close</option>
                </FieldGroup>
                <FormGroup>
                    <Col xsPush={1} xs={11} smOffset={2} sm={6}>
                        <Button type="submit">
                            { button }
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
    fetchResourceRequest: PropTypes.func.isRequired
}

export default ResourceRequestForm;