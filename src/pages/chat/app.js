import React from 'react'
import { render } from 'react-dom'
import { Grid, Row, Col, Nav, Navbar, NavItem, Button } from 'react-bootstrap'
import NavigationBar from '../../components/navigation-bar.js'
import SearchBox from '../../components/search-box.js'
import ChatSidebar from './components/chat-sidebar'
import ChatBox from './components/chat-box'

const mql = window.matchMedia(`(min-width: 800px)`);
export default class App extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
           total_popups: 0,
           popups: []
        }

        this.handleRegisterPopup = this.handleRegisterPopup.bind(this)
        this.handleClosePopup = this.handleClosePopup.bind(this)
        this.calculatePopups = this.calculatePopups.bind(this)
    }

    componentWillMount() {
       console.log(`chat\app will mount`)
         //this function can remove a array element.
        Array.remove = function(array, from, to) {
            var rest = array.slice((to || from) + 1 || array.length);
            array.length = from < 0 ? array.length + from : from;
            return array.push.apply(array, rest);
        };
    }

    componentWillUnmount() {
       console.log(`chat\app will unmount`)
    }

    calculatePopups()
    {
        let width = document.getElementById('chat-panel').getBoundingClientRect().width
        let total_popups = 0;
        if(width >= 540)
        {
            width = width - 200;
            //320 is width of a single popup box
            total_popups = parseInt(width/320);
        }
        return total_popups;
    }

    handleClosePopup(id)
    {
        const popups = this.state.popups.slice();
        for(var iii = 0; iii < popups.length; iii++)
        {
            if(id == popups[iii].id)
            {
                Array.remove(popups, iii);
                
                const total_popups = this.calculatePopups();
                
                this.setState(Object.assign({}, this.state, {popups, total_popups}))
                
                return;
            }
        }   
    }

    handleRegisterPopup(id, name) {

        const popups = this.state.popups.slice();
        let total_popups = 0;

        for(var iii = 0; iii < popups.length; iii++)
        {   
            //already registered. Bring it to front.
            if(id === popups[iii].id)
            {
                Array.remove(popups, iii);
            }
        }               
        
        popups.unshift({id, name});
        total_popups = this.calculatePopups();

        this.setState(Object.assign({}, this.state, {popups, total_popups}))
    }
 
    render() {
        let _chatboxes = [];

        if (this.state.total_popups && this.state.popups.length > 0 ) {
            let right = window.innerWidth - document.getElementById('chat-panel').getBoundingClientRect().right + 220;
            for (let i=0; i <= this.state.total_popups && i < this.state.popups.length; i++) {
                _chatboxes.push(<ChatBox right={{ right: right}} key={this.state.popups[i].id} handleClosePopup={this.handleClosePopup} name={this.state.popups[i].name} id={this.state.popups[i].id}></ChatBox>)
                right = right + 320;
            }
        }
        
        return (
            <Grid>
                <Row className='show-grid'>
                    <Col sm={12}>
                        <NavigationBar showSearchBox={true}>
                        <Nav onSelect={ (eventKey) => console.log(`resource_requests/app eventKey is clicked`)}>
                            <NavItem eventKey={1} href="#">About</NavItem>
                            <li role="presentation">
                                <a href="/contact">Contact</a>
                            </li>
                            <li role="presentation"><a style={{'backgroundColor':'#337ab7', 'borderColor':'#2e6da4', 'color':'#fff'}} href='/resource/request/create'>Create</a></li>
                            <li role="presentation"><a href='/report'>Report</a></li>
                        </Nav>
                        <Nav pullRight>
                            <li role="presentation"><SearchBox/></li>
                            <li role="presentation"><a href='/signin/signout'>Sign Out</a></li>
                        </Nav>
                        </NavigationBar>        
                    </Col>
                </Row>
                <Row className='show-grid'>
                    <Col sm={12} id='chat-panel'>
                        <ChatSidebar handleRegisterPopup={this.handleRegisterPopup}/>
                        {_chatboxes}
                    </Col>
                </Row>
            </Grid>
        )   
    }
}