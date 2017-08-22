import React from 'react'

export default class ChatBox extends React.Component {
    componentWillMount() {
        console.log(`chat/components/chat-box will mount`)
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
                        Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh. Donec sodales sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit cursus nunc,
                    </div>
                    <div class="popup-footer" style={{lineHeight: '2em'}}>
                        <form className='chat' action="">
                            <input id="m" autoComplete="off" style={{width: '80%', marginTop: '1px'}}/><button style={{fontWeight: 'bold', color: 'white', width: '20%', background: '#6d84b4', marginTop: '1px'}}>Send</button> 
                        </form>
                    </div>
                </div>)
    }
}  