import React from 'react'
import { Grid, Row, Form, FormGroup, FormControl, Col, ControlLabel, Button, HelpBlock } from 'react-bootstrap'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
const Qs = require('qs')

import FieldGroup from '../../../components/form/field-group'
import { handleLoginRequest } from '../actions.js'


class LoginForm extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.state = {};
    }

    handleChange(event) {
        const target = event.target;
        this.setState(Object.assign({}, this.state, { [target.id]: target.value }));
        console.log(`login-form state changed to ${JSON.stringify(this.state)}`);
    }

    handleSubmit(e) {
        e.preventDefault();
        const { username, password } = this.state;                                                        
        this.props.handleSubmit({username, password})
                            .then( () => {  
                                if (this.props.success) {
                                    const query = Qs.parse(window.location.search.substring(1));

                                    if (query.returnUrl) {
                                        window.location.href = query.returnUrl;
                                    }
                                    else {
                                        window.location.href = '/resource/request';
                                    }
                 
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
                <FieldGroup id="username" label="Username:" type="text" placeholder="Username" onChange={this.handleChange} value={ this.state.username || ''} help={ this.props.help.username }/>
                <FieldGroup id="password" label="Password:" type="password" placeholder="Password" onChange={this.handleChange} value={ this.state.password || ''} help={ this.props.help.password}/>
                <FormGroup>
                    <Col xsPush={1} xs={11} smOffset={2} sm={6}>
                        <Button bsStyle="primary" type="submit" onClick={this.handleSubmit}>
                            Login
                        </Button>
                    </Col>
                </FormGroup>
            </Form>
        );
    }
}

LoginForm.propTypes = {
    handleSubmit: PropTypes.func.isRequired
}


const mapDispatchToProps = dispatch => {
  return {
    handleSubmit: (account) => {
        console.log(`login/components/login-form handle submission with parameters: ${JSON.stringify(account)}`);
        return dispatch(handleLoginRequest(account))
    }
  }
}

const mapStateToProps = (state,ownProps) => {
  return state.login;
}

export default connect(mapStateToProps,mapDispatchToProps)(LoginForm);