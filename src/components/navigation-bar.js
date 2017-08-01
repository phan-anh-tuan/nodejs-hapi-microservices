import React from 'react'
import { Navbar, Nav, NavItem, Col, FormControl  } from 'react-bootstrap'

import PropTypes from 'prop-types'

class NavigationBar extends React.Component {
    render() {
        return (
            <Navbar collapseOnSelect fluid>
                <Navbar.Header>
                    <Navbar.Brand>
                    <a href="/"><img style={{ height: '32px', width: '32px', position: 'relative', top: '-9px'}} src="/assets/img/logo-square.png"/></a>
                    </Navbar.Brand>
                    <Navbar.Toggle />
                </Navbar.Header>
                { this.props.showSearchBox && <Col className='search-container' xs={8} lgHidden>
                    <FormControl type="text" placeholder="Enter some keyword..." name="search" className="searchbox-input-small"/>
                </Col>}
                <Navbar.Collapse>
                    {this.props.children}
                </Navbar.Collapse>
            </Navbar>
        );
    }
}
/*
NavigationBar.propTypes = {
    handleSubmit: PropTypes.func.isRequired
}
*/

export default NavigationBar