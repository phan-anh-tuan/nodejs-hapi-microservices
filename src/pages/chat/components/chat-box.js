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
        this.props.handleSubmit(this.state.m)
        this.setState(Object.assign({}, this.state, { m: '' }));
        e.preventDefault();
    }

    componentWillMount() {
        console.log(`chat/components/chat-box will mount`)
    }

    componentWillUnmount() {
        console.log(`chat/components/chat-box will unmount`)
    }

    render() {
         
        let _messages = [];
        this.props.messages.forEach( msg => {
            _messages.push(<li><strong>{msg.from}:</strong>&nbsp;<span>{msg.message}</span></li>)
        })
        return (<div className="popup-box chat-popup" id={this.props.id} style={this.props.right}>
                    <div className="popup-head">
                        <div className="popup-head-left">{this.props.name}</div>
                        <div className="popup-head-right"><a onClick={() => this.props.handleClosePopup(this.props.id)}>&#10005;</a></div>
                        <div style={{clear: 'both'}}></div>
                    </div>
                    <div className="popup-messages">
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