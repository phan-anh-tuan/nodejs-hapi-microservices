import React from 'react'

export default class ChatBox extends React.Component {
    componentWillMount() {
        console.log(`chat/components/chat-box will mount`)
        $(document).ready(function(){
            var socket = io.connect(`${window.location.origin}?token=${window.userId}`);
            $('form.chat').submit(function(){
                console.log(`chat/app prepare to submit message`)
                socket.emit('io:message', 
                {
                    from: window.username,
                    to: "custom:id:5975521f4a9369769347a129",  //hard-coded
                    message: $('#m').val()
                });
                $('#m').val('');
                return false;
            });
            socket.on('chat:messages:latest', function(msg){
                $('#messages').append($('<li>').html('<strong>'+msg.from+':</strong>&nbsp;<span>'+msg.message+'</span'));
                $('.popup-messages').scrollTop($('.popup-messages')[0].scrollHeight);
                notifyMe(msg.message);
                //window.scrollTo(0, document.body.scrollHeight);
            });
        })
    }

    componentWillUnmount() {
        console.log(`chat/components/chat-box will unmount`)
    }
    render() {
        return (<div className="popup-box chat-popup" id={this.props.id} style={this.props.right}>
                    <div className="popup-head">
                        <div className="popup-head-left">{this.props.name}</div>
                        <div className="popup-head-right"><a onClick={() => this.props.handleClosePopup(this.props.id)}>&#10005;</a></div>
                        <div style={{clear: 'both'}}></div>
                    </div>
                    <div className="popup-messages">
                         <ul id="messages"></ul>   
                    </div> 
                    <div className="popup-footer" style={{lineHeight: '2em'}}>
                        <form className='chat' action="">
                            <input id="m" autoComplete="off" style={{width: '80%', marginTop: '1px'}}/><button style={{fontWeight: 'bold', color: 'white', width: '20%', background: '#6d84b4', marginTop: '1px'}}>Send</button> 
                        </form>
                    </div>
                </div>)
    }
}  