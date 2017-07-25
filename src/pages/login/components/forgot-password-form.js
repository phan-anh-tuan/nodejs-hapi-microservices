import React from 'react'
import { Row, Form, FormGroup, FormControl, Col, ControlLabel, Button, HelpBlock } from 'react-bootstrap'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import FieldGroup from '../../../components/form/field-group'
import { handleForgotPasswordRequest } from '../actions.js'


class ForgotPasswordForm extends React.Component {
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
        const email = this.state.email;                                                        
        this.props.handleSubmit(email);
        //console.log(`forgot-password-form handleSubmit fired with parameter ${email}`)
    }

    render() {

        const alerts = [];

        if (this.props.success) {
            alerts.push(<div key="success">
                <div className="alert alert-success">
                    If an account matched that address, an email will be sent with instructions.
                </div>
                <Link to="/signin" className="btn btn-link">Back to login</Link>
            </div>);
        }

        if (this.props.error) {
            alerts.push(<div key="danger" className="alert alert-danger">
                {this.props.error}
            </div>);
        }

        return (
            <section>
                <h1 className="page-header">Forgot your password?</h1>
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
                    <FormGroup>
                        <Col xsPush={1} xs={11} smOffset={2} sm={6}>
                            {alerts}
                        </Col>
                    </FormGroup>
                    {!this.props.success &&
                        <FieldGroup id="email" label="Email:" type="email" placeholder="What's your email?" onChange={this.handleChange} value={ this.state.email || ''} help={ this.props.help.email }/>
                    }
                    {!this.props.success &&
                        <FormGroup>
                            <Col xsPush={1} xs={11} smOffset={2} sm={6}>
                                <Link to="/signin" className="btn btn-link">Back to login</Link>
                                {" "}
                                <Button bsStyle="primary" type="submit" onClick={this.handleSubmit}>
                                    Submit
                                </Button>
                            </Col>
                        </FormGroup>
                    }
                </Form>
            </section>
        );
    }
}


ForgotPasswordForm.propTypes = {
    handleSubmit: PropTypes.func.isRequired
}


const mapDispatchToProps = dispatch => {
  return {
    handleSubmit: (email) => {
        return dispatch(handleForgotPasswordRequest(email))
    }
  }
}

const mapStateToProps = (state,ownProps) => {
  return state.forgot;
}

export default connect(mapStateToProps,mapDispatchToProps)(ForgotPasswordForm);
