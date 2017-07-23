import React from 'react'
import { Grid, Row, Form, FormGroup, FormControl, Col, ControlLabel, Button, HelpBlock } from 'react-bootstrap'
import PropTypes from 'prop-types'
import FieldGroup from '../form/field-group'
import { connect } from 'react-redux'

class SignUpForm extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.state = { isBlocking: false, isSubmitting: false }
    }

    handleChange(event) {
        const target = event.target;
        this.setState(Object.assign({}, this.state, { isBlocking: true, [target.id]: target.value }));
        console.log(`state = ${JSON.stringify(this.state)}`);
    }

    handleSubmit(e) {
        this.setState(Object.assign({}, this.state, {   isBlocking: false, 
                                                        isSubmitting: true }));
        const { name, email, username, password } = this.state                                                        
        this.props.handleSubmit({name, email, username, password})
        /*
        .then( () => {  
                                                  this.props.history.push('/');
                                                })
                                .catch((error) => {
                                                    console.log('sign_up_form handleSubmit fail with error message', error.message);
                                                })*/
        e.preventDefault();
    }

    render() {
        return (
            <Form horizontal>
                { 
                    this.state.isSubmitting && 
                    <FormGroup>
                        <Col componentClass={ControlLabel} xsPush={1} xs={11} sm={2}>
                            {" "}
                        </Col>
                        <Col xsPush={1} xs={11} sm={6}>
                            <HelpBlock>{"Processing...."}</HelpBlock>
                        </Col>
                    </FormGroup>
                }
                <FieldGroup id="name" label="Name:" type="text" placeholder="Account Name" onChange={this.handleChange} value={ this.state.name || ''}/>
                <FieldGroup id="email" label="Email:" type="email" placeholder="Email" onChange={this.handleChange} value={ this.state.email || ''}/>
                <FieldGroup id="username" label="Username:" type="text" placeholder="Username" onChange={this.handleChange} value={ this.state.username || ''}/>
                <FieldGroup id="password" label="Password:" type="password" placeholder="Password" onChange={this.handleChange} value={ this.state.password || ''}/>
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
      //dispatch(fetchTodos())
      console.log(`submit account ${JSON.stringify(account)}`);
    }
  }
}

export default connect(null,mapDispatchToProps)(SignUpForm);