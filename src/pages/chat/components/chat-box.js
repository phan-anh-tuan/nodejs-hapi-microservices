import React from 'react'

export default class ChatBox extends React.Component {

    constructor(props) {
        super(props)
        this.state = {}
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        const target = event.target;
        this.setState(Object.assign({}, this.state, { [target.id]: target.value }));
    }

    handleSubmit(e) {
        this.props.handleSubmit(this.props.id,this.state.m)
        //$(this.popupMessages).scrollTop($(this.popupMessages)[0].scrollHeight);
        this.setState(Object.assign({}, this.state, { m: '' }));
        e.preventDefault();
    }

    componentWillMount() {
        console.log(`chat/components/chat-box will mount`)
    }

    componentDidMount() {
        const uploadImageSelector = `div#${this.props.id} div.popup-head div.popup-head-right img:nth-child(2)`
        const videoCallImageSelector = `div#${this.props.id} div.popup-head div.popup-head-right img:nth-child(1)`
        const fileChooserSelector = `div#${this.props.id} input[type="file"]`
        const recipientId = this.props.id;
        const recipientName = this.props.name;
        $(uploadImageSelector).on("click", function() {
            $(fileChooserSelector).trigger("click");
        });
        $(videoCallImageSelector).on("click", function() {
            call(recipientName)
        });
        if(window.File && window.FileReader){ //These are the relevant HTML5 objects that we are going to use 
            $(fileChooserSelector).on('change', function(evnt){
                const SelectedFile = evnt.target.files[0];
                SelectedFiles.set(`${window.userId}:${recipientId}:${SelectedFile.name}`,SelectedFile);
                if(SelectedFile.name !== "")
                {
                    FReader = new FileReader();
                    FReader.onload = function(evnt){
                        //console.log('chat-box.js Emit Upload event')
                        window.socket.emit('fileupload:upload', { 'Name' : SelectedFile.name, Data : evnt.target.result, From: window.userId, FromUserName: window.username,  To: recipientId });
                    }
                    window.socket.emit('fileupload:start', { 'Name' : SelectedFile.name, 'Size' : SelectedFile.size, From: window.userId, To: recipientId});
                }
                else
                {
                    alert("Please Select A File");
                }
            });
        }
        else
        {
            alert("Your Browser Doesn't Support The File API Please Update Your Browser");
        }

        console.log(`chat/components/chat-box did mount`)
    }

    componentWillUnmount() {
        console.log(`chat/components/chat-box will unmount`)
    }

    render() {
          
        let _messages = [];
        this.props.messages.forEach( msg => {
            if (msg.type === 'url') {
                _messages.push(<li><strong>{msg.from.split(':')[0]}:</strong>&nbsp;<span dangerouslySetInnerHTML={{__html: msg.message}} /></li>)
            } else {
                _messages.push(<li><strong>{msg.from.split(':')[0]}:</strong>&nbsp;<span>{msg.message}</span></li>)
            }
        })
        return (<div className="popup-box chat-popup" id={this.props.id} style={this.props.right}>
                    <input type="file" style={{display: 'none'}} />
                    <div className="popup-head">
                        <div className="popup-head-left">{this.props.name}</div>
                        <div className="popup-head-right"><img width="30" height="30" src="/assets/img/videocall.png" />{' '}<img width="30" height="30" src="/assets/img/camera1600.png" />{'  '}<a onClick={() => this.props.handleClosePopup(this.props.id)}>&#10005;</a></div>
                        <div style={{clear: 'both'}}></div>
                    </div>
                    <div className="popup-messages"  ref={(input) => { this.popupMessages = input; }}>
                         <ul id="messages">{_messages}</ul>   
                    </div> 
                    <div className="popup-footer" style={{lineHeight: '2em'}}>
                        <form className='chat'>
                            <input id="m" autoComplete="off" onChange={this.handleChange} value={ this.state.m || ''} style={{width: '80%', marginTop: '1px'}}/>
                            <button onClick={this.handleSubmit} style={{fontWeight: 'bold', color: 'white', width: '20%', background: '#6d84b4', marginTop: '1px'}}>Send</button> 
                        </form>
                    </div>
                </div>)
    }
}  