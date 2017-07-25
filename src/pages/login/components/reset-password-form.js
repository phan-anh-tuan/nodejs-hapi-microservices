import React from 'react'
import { Row, Form, FormGroup, FormControl, Col, ControlLabel, Button, HelpBlock } from 'react-bootstrap'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import FieldGroup from '../../../components/form/field-group'
import { handleResetPasswordRequest } from '../actions.js'


class ResetPasswordForm extends React.Component {
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
        const key = this.props.match.params.key
        const email = this.props.match.params.email
        const password  = this.state.password;                                                        
        this.props.handleSubmit({ email, key, password });
    }

    render() {

        const alerts = [];

        if (this.props.success) {
            alerts.push(<div key="success">
                <div className="alert alert-success">
                    Your password has been reset. Please login to confirm.
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
                <h1 className="page-header">Reset your password?</h1>
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
                    {!this.props.success && <FieldGroup id="password" label="New Password:" type="password" placeholder="Enter your new password" onChange={this.handleChange} value={ this.state.password || ''} help={ this.props.help.password }/> }
                    {!this.props.success && <FieldGroup id="HiddenField" label="HiddenField:" type="hidden"/> }
                    
                    {!this.props.success &&
                        <FormGroup>
                            <Col xsPush={1} xs={11} smOffset={2} sm={6}>
                                <Link to="/signin" className="btn btn-link">Back to login</Link>
                                {" "}
                                <Button bsStyle="primary" type="submit" onClick={this.handleSubmit}>
                                    Set Password
                                </Button>
                            </Col>
                        </FormGroup>
                    }
                </Form>
            </section>
        );
    }
}


ResetPasswordForm.propTypes = {
    handleSubmit: PropTypes.func.isRequired
}


const mapDispatchToProps = dispatch => {
  return {
    handleSubmit: (document) => {
        return dispatch(handleResetPasswordRequest(document))
    }
  }
}

const mapStateToProps = (state,ownProps) => {
  return state.reset;
}

export default connect(mapStateToProps,mapDispatchToProps)(ResetPasswordForm);
