import React from 'react'
import { Grid, Row, Form, FormGroup, FormControl, Col, ControlLabel, Button, HelpBlock } from 'react-bootstrap'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import FieldGroup from '../../../components/form/field-group'
import { handleRegisterRequest } from '../actions.js'


class SignUpForm extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.state = {};
    }

    handleChange(event) {
        const target = event.target;
        this.setState(Object.assign({}, this.state, { [target.id]: target.value }));
        //console.log(`sign-up-form state changed to ${JSON.stringify(this.state)}`);
    }

    handleSubmit(e) {
        e.preventDefault();
        const { name, email, username, password } = this.state;                                                        
        this.props.handleSubmit({name, email, username, password})
                            .then( () => {  
                                if (this.props.success) {
                                    window.location = window.location.origin;
                                }
                            })
    }

    render() {
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
                        <Col componentClass={ControlLabel} xsPush={1} xs={11} sm={2}>
                            {" "}
                        </Col>
                        <Col xsPush={1} xs={11} sm={6}>
                            <HelpBlock>{this.props.error}</HelpBlock>
                        </Col>
                    </FormGroup>
                }
                <FieldGroup id="name" label="Name:" type="text" placeholder="Account Name" onChange={this.handleChange} value={ this.state.name || ''} help={ this.props.help.name }/>
                <FieldGroup id="email" label="Email:" type="email" placeholder="Email" onChange={this.handleChange} value={ this.state.email || ''} help={ this.props.help.email }/>
                <FieldGroup id="username" label="Username:" type="text" placeholder="Username" onChange={this.handleChange} value={ this.state.username || ''} help={ this.props.help.username }/>
                <FieldGroup id="password" label="Password:" type="password" placeholder="Password" onChange={this.handleChange} value={ this.state.password || ''} help={ this.props.help.password}/>
                <FormGroup>
                    <Col xsPush={1} xs={11} smOffset={2} sm={6}>
                        <Button onClick={window.history.back}>
                            Back
                        </Button>
                        {" "}
                        <Button type="submit" onClick={this.handleSubmit}>
                            Create my account
                        </Button>
                    </Col>
                </FormGroup>
            </Form>
        );
    }
}

SignUpForm.propTypes = {
    handleSubmit: PropTypes.func.isRequired
}


const mapDispatchToProps = dispatch => {
  return {
    handleSubmit: (account) => {
        console.log(`signup/components/sign-up-form handle submission with parameters: ${JSON.stringify(account)}`);
        return dispatch(handleRegisterRequest(account))
    }
  }
}

const mapStateToProps = (state,ownProps) => {
  return state.accounts;
}

export default connect(mapStateToProps,mapDispatchToProps)(SignUpForm);