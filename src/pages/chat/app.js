import React from 'react'
import { render } from 'react-dom'
import { Grid, Row, Col, Nav, Navbar, NavItem, Button } from 'react-bootstrap'
import fetch from 'isomorphic-fetch'
import {ApiEndpoint} from '../api-endpoint'
import NavigationBar from '../../components/navigation-bar.js'
import SearchBox from '../../components/search-box.js'
import ChatSidebar from './components/chat-sidebar'
import ChatBox from './components/chat-box'
import '../../../public/css/chat.css'

const mql = window.matchMedia(`(min-width: 800px)`);
export default class App extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            total_popups: 0,
            popups: [],
            onlines: [],
            rooms: [{id:'room_public', name:'public'}]
        }

        this.handleRegisterPopup = this.handleRegisterPopup.bind(this)
        this.handleClosePopup = this.handleClosePopup.bind(this)
        this.calculatePopups = this.calculatePopups.bind(this)
        this.handleSendMessage = this.handleSendMessage.bind(this)
        this.handleMessageArrival = this.handleMessageArrival.bind(this)
        this.handlePersonOnline = this.handlePersonOnline.bind(this)
        this.handlePersonOffline = this.handlePersonOffline.bind(this)
    }

    handlePersonOnline(msg) {
        const onlines = this.state.onlines.slice();
        let found = false
        for(var iii = 0; iii < onlines.length & !found; iii++)
        {   
            if(msg.id === onlines[iii].id)
            {
                found = true;
            }
        }               
        if (!found) {
            onlines.push({id: msg.id, name: msg.name, new_message: false})
            this.setState(Object.assign({}, this.state, {onlines}))
        } 
        notifyMe(`${msg.name} is online`);
    }

    handlePersonOffline(msg) {
        const onlines = this.state.onlines.slice();
        let found = false
        for(var iii = 0; iii < onlines.length & !found; iii++)
        {   
            if(msg.id === onlines[iii].id)
            {
                found = true;
                onlines.splice(iii,1)
                this.setState(Object.assign({}, this.state, {onlines}))
            }
        }               
        
        notifyMe(`${msg.name} is offline`);
    }

    handleMessageArrival(msg,selfMsg = false) {
        
        //notifyMe(msg.message);
        const popups = this.state.popups.slice();
        let {from, to} = msg
        const [name,id] = from.split(':')
        let found = false
        let popupMessageSelector = ``
        //room message
        if (to.indexOf('custom:id:room') !== -1) {
            const roomId = to.substring(10)
            for(var iii = 0; iii < popups.length & !found; iii++)
            {   
                if( roomId === popups[iii].id)
                {
                    found = true;
                    popups[iii].messages.push(msg)
                    popupMessageSelector = `div#${popups[iii].id} div.popup-messages`
                    this.setState(Object.assign({}, this.state, {popups}))
                    $(popupMessageSelector).scrollTop($(popupMessageSelector)[0].scrollHeight + 50);
                }
            }       

            if (!found) {
                const roomName = 'public' // hard-coded for now, you should get it from this.state.rooms
                this.handleRegisterPopup(roomId,roomName)
                this.handleMessageArrival(msg)
            }
            return;
        }
        // 1-1 message
        for(var iii = 0; iii < popups.length & !found; iii++)
        {   
            if (!selfMsg) {
                //is name unique ???
                if(name === popups[iii].name)
                {
                    found = true;
                    popups[iii].messages.push(msg)
                    popupMessageSelector = `div#${popups[iii].id} div.popup-messages`
                }
            } else {
                if(msg.to === popups[iii].id)
                {
                    found = true;
                    popups[iii].messages.push(msg)
                    popupMessageSelector = `div#${popups[iii].id} div.popup-messages`
                }
            }
        }               
        if (found) {
            this.setState(Object.assign({}, this.state, {popups}))
        
            $(popupMessageSelector).scrollTop($(popupMessageSelector)[0].scrollHeight + 50);
        } else {
            //TODO update chat-sidebar

            //What I did below if for demonstration purpose
            this.handleRegisterPopup(id,name)
            this.handleMessageArrival(msg)
        }
    }

    componentWillMount() {
       console.log(`chat/app will mount`)
         //this function can remove a array element.
        Array.remove = function(array, from, to) {
            var rest = array.slice((to || from) + 1 || array.length);
            array.length = from < 0 ? array.length + from : from;
            return array.push.apply(array, rest);
        };

        const _self = this
        $(document).ready(function(){
            socket = window.io.connect(`${window.location.origin}?token=${window.userId}`);
            socket.on('chat:messages:latest', _self.handleMessageArrival);
            socket.on('chat:person:online', _self.handlePersonOnline);
            socket.on('chat:person:offline', _self.handlePersonOffline);
            socket.on('fileupload:done', function() { alert('upload complete')});
            socket.on('fileupload:moredata', function (data){
                const SelectedFile = SelectedFiles.get(`${data['From']}:${data['To']}:${data['Name']}`);
                const Place = data['Place'] * 524288; //The Next Blocks Starting Position
                let NewFile; //The Variable that will hold the new Block of Data
                if(SelectedFile.webkitSlice) 
                    NewFile = SelectedFile.webkitSlice(Place, Place + Math.min(524288, (SelectedFile.size-Place)));
                else if(SelectedFile.mozSlice) 
                    NewFile = SelectedFile.mozSlice(Place, Place + Math.min(524288, (SelectedFile.size-Place)));
                else 
                    NewFile = SelectedFile.slice(Place, Place + Math.min(524288, (SelectedFile.size-Place)));
                //console.log(`app.js reading ${SelectedFile.name} from byte ${Place}th to byte ${Math.min(524288, (SelectedFile.size-Place))}`)
                //FReader.readAsArrayBuffer(NewFile);
                FReader.readAsBinaryString(NewFile);
            });

            socket.on('webrtc:message', function(message) {
                console.info('Received message: ' + message);
                var parsedMessage = JSON.parse(message);
                

                switch (parsedMessage.id) {
                    case 'registerResponse':
                        resgisterResponse(parsedMessage);
                        break;
                    case 'callResponse':
                        callResponse(parsedMessage);
                        break;
                    case 'screenSharingResponse':
                        screenSharingResponse(parsedMessage);
                        break;
                    case 'incomingCall':
                        incomingCall(parsedMessage);
                        break;
                    case 'screenSharing':
                        screenSharing(parsedMessage);
                        break;
                    case 'startCommunication':
                        startCommunication(parsedMessage);
                        break;
                    case 'startScreenSharing':
                        startScreenSharing(parsedMessage);
                        break;
                    case 'stopCommunication':
                        console.info("Communication ended by remote peer");
                        stop(true);
                        break;
                    case 'stopScreenSharing':
                        console.info("Screen sharing ended by remote peer");
                        stopScreenSharing(true);
                        break;
                    case 'iceCandidate':
                        webRtcPeer.addIceCandidate(parsedMessage.candidate)
                    case 'screenSharingIceCandidate':
                        webRtcScreenSharingPeer.addIceCandidate(parsedMessage.candidate)
                        break;
                    default:
                        console.error('Unrecognized message', parsedMessage);
                }
            })
            register(window.username)

            //console = new Console();
            setRegisterState(NOT_REGISTERED);
            //var drag = new Draggabilly(document.getElementById('videoSmall'));
            videoInput = document.getElementById('videoInput');
            videoOutput = document.getElementById('videoOutput');
            videoScreenSharingInput= document.getElementById('screenSharingInput');
            document.getElementById('terminate').addEventListener('click', function() {
                stop();
            }); 
          
            document.getElementById('stopScreenSharing').addEventListener('click', function() {
                stopScreenSharing();
            }); 
            //window.onunload = function() {
            $(window).unload(function(){
                console.log(`closing the socket`)
                socket.close();
            })
            
            
        })

        //get online contact list
        fetch(`${ApiEndpoint}/online/contact`,{ credentials: 'same-origin'})
                .then( response => { 
                    console.log(`chat/app.js`)
                    return response.json()})
                .then( json => { 
                    const onlines = []
                    json.forEach(e => {
                        if (e[0] !== window.userId) { //do not list myself on the chat sidebar
                            onlines.push({id: e[0], name: e[1], new_message: false})
                        }
                    })
                    this.setState(Object.assign({},this.state,{onlines}))
                })
                .catch( error => console.log(error))
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

    handleSendMessage(t,m) {
        console.log(`pages/chat/app.js send message ${m}`)
        window.socket.emit('io:message', 
        {
            from: `${window.username}:${window.userId}`,
            //from: window.username,
            to: `custom:id:${t}`,
            message: m
        });
        if (t.indexOf('room') === -1) {
            this.handleMessageArrival({ from: `me:${window.userId}`, to: t, message:m },true)
        }
    }

    handleRegisterPopup(id, name) {

        const popups = this.state.popups.slice();
        let total_popups = 0;
        const messages = []

        for(var iii = 0; iii < popups.length; iii++)
        {   
            //already registered. Bring it to front.
            if(id === popups[iii].id)
            {
                Array.remove(popups, iii);
            }
        }               
        
        popups.unshift({id, name, messages});
        total_popups = this.calculatePopups();

        this.setState(Object.assign({}, this.state, {popups, total_popups}))
    }
 
    render() {
        let _chatboxes = [];

        if (this.state.total_popups && this.state.popups.length > 0 ) {
            let right = window.innerWidth - document.getElementById('chat-panel').getBoundingClientRect().right + 220;
            for (let i=0; i <= this.state.total_popups && i < this.state.popups.length; i++) {
                _chatboxes.push(<ChatBox handleSubmit={this.handleSendMessage} right={{ right: right, zIndex: 20}} key={this.state.popups[i].id} handleClosePopup={this.handleClosePopup} name={this.state.popups[i].name} id={this.state.popups[i].id} messages={this.state.popups[i].messages}></ChatBox>)
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
                        <ChatSidebar handleRegisterPopup={this.handleRegisterPopup} onlines={this.state.onlines} rooms={this.state.rooms}/>
                        {_chatboxes}
                    </Col>
                </Row>
                <Row className='show-grid'>
                    <Col sm={12} id='video-panel'>
                        <a id="terminate" href="#" className="btn btn-danger">
                            <span className="glyphicon glyphicon-stop"></span> Stop</a>{" "}
                        <a id="screenSharing" href="#" className="btn btn-primary" disabled="disabled">
                            <img style={{ width:"40px", height:"20px" }} src="/assets/img/screensharing.png"/></a>{" "}
                        <a id="stopScreenSharing" href="#" className="btn btn-danger" disabled="disabled">
                            <img style={{ width:"40px", height:"20px" }} src="/assets/img/stopscreensharing.png"/></a>
                        <div id="videoBig" style={{
                                                    width: '640px',
                                                    height: '480px',
                                                    top: 0,
                                                    left: 0,
                                                    zIndex: 1
                                                }}>
                            <video id="videoOutput" autoPlay width="640px" height="480px" poster="assets/img/webrtc.png"></video>
                        </div>
                        <video id="screenSharingInput" autoPlay width="1px" height="1px"/>
                        <div id="videoSmall" style={{
                                                            width: '240px',
                                                            height: '180px',
                                                            padding: '0px',
                                                            position: 'absolute',
                                                            top: '35px',
                                                            left: '415px',
                                                            cursor: 'pointer',
                                                            zIndex: 10,
                                                            padding: '0px',
                                                        }}>
                            <video id="videoInput" autoPlay width="240px" height="180px" poster="assets/img/webrtc.png"></video>
                        </div>
                    </Col>
                </Row>
            </Grid>
        )   
    }
}