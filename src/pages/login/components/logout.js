'use strict';

const React = require('react');
const ReactRouter = require('react-router-dom');
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { handleLogoutRequest } from '../actions.js'

const Link = ReactRouter.Link;


class Logout extends React.Component {
    constructor(props) {
        super(props);
        this.input = {};
    }

    componentDidMount() {
        this.props.handleSubmit();
    }


    render() {

        const alerts = [];

        if (this.props.success) {
            alerts.push(<div key="success" className="alert alert-success">
                Logout successful.
            </div>);
        }
        else if (this.props.error) {
            alerts.push(<div key="danger" className="alert alert-warning">
                {this.props.error}
            </div>);
        }

        return (
            <section>
                <h1 className="page-header">Sign out</h1>
                {alerts}
                <Link to="/signin" className="btn btn-link">Back to Sign In</Link>
            </section>
        );
    }
}

Logout.propTypes = {
    handleSubmit: PropTypes.func.isRequired
}


const mapDispatchToProps = dispatch => {
  return {
    handleSubmit: () => {
        return dispatch(handleLogoutRequest())
    }
  }
}

const mapStateToProps = (state,ownProps) => {
  return state.logout;
}

export default connect(mapStateToProps,mapDispatchToProps)(Logout);

