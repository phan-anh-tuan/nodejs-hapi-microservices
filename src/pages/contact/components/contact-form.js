import React from 'react'
import { Grid, Row, Form, FormGroup, FormControl, Col, ControlLabel, Button, HelpBlock } from 'react-bootstrap'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import FieldGroup from '../../../components/form/field-group'
import { handleMessageSubmission } from '../actions.js'


class ContactForm extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.state = {};
    }

    handleChange(event) {
        const target = event.target;
        this.setState(Object.assign({}, this.state, { [target.id]: target.value }));
    }

    handleSubmit(e) {
        e.preventDefault();
        const { name, email, message } = this.state;                                                        
        this.props.handleSubmit({name, email, message})
                            .then( () => {  
                                if (this.props.success) {
                                    this.state = {};
                                }
                            })
    }

    render() {
        const alerts = [];        
        alerts.push(<div key="danger" className="alert alert-danger">
                {this.props.error}
            </div>);

        alerts.push(<div key="success" className="alert alert-success">
                Your message has been sent.
            </div>);
        return (
            <Form horizontal>
                {  
                    this.props.loading && 
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
                    this.props.error && 
                    <FormGroup>
                        <Col xsPush={1} xs={11} smOffset={2} sm={6}>
                            {alerts[0]}
                        </Col>
                    </FormGroup>
                }
                { 
                    this.props.success && 
                    <FormGroup>
                        <Col xsPush={1} xs={11} smOffset={2} sm={6}>
                            {alerts[1]}
                        </Col>
                    </FormGroup>
                }
                <FieldGroup id="name" label="Name:" type="text" placeholder="Account Name" onChange={this.handleChange} value={ this.state.name || ''} help={ this.props.help.name }/>
                <FieldGroup id="email" label="Email:" type="email" placeholder="Email" onChange={this.handleChange} value={ this.state.email || ''} help={ this.props.help.email }/>
                <FieldGroup id="message" label="Message:" type="textarea" placeholder="Message" onChange={this.handleChange} value={ this.state.message || ''} help={ this.props.help.message }/>

                <FormGroup>
                    <Col xsPush={1} xs={11} smOffset={2} sm={6}>
                        <Button bsStyle="primary" type="submit" onClick={this.handleSubmit}>
                            Send
                        </Button>
                    </Col>
                </FormGroup>
            </Form>
        );
    }
}

ContactForm.propTypes = {
    handleSubmit: PropTypes.func.isRequired
}


const mapDispatchToProps = dispatch => {
  return {
    handleSubmit: (data) => {
        return dispatch(handleMessageSubmission(data))
    }
  }
}

const mapStateToProps = (state,ownProps) => {
  return state;
}

export default connect(mapStateToProps,mapDispatchToProps)(ContactForm);