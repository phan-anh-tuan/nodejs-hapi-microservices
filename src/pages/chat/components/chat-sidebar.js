import React from 'react'
import PropTypes from 'prop-types'
import Responsive from 'react-responsive';


function Contact(props) {
    const styles = {
            sidebar_name: {
                paddingLeft: '10px',
                paddingRight: '10px',
                marginBottom: '15px'
            },
            sidebar_name_span:
            {
                paddingLeft: '5px'
            },
            sidebar_name_a:
            {
                height: '100%',
                textDecoration: 'none',
                color: 'inherit'
            },
            sidebar_name_img:
            {
                width: '32px',  
                height: '32px',
                verticalAlign: 'middle'
            }
        }
    return (
        <div className='sidebar-name' style={styles.sidebar_name}>
                <a style={styles.sidebar_name_a} onClick={() => props.handleRegisterPopup(props.id,props.name)}>
                    <img style={styles.sidebar_name_img} width="30" height="30" src="http://qnimate.com/wp-content/uploads/2014/12/Screen-Shot-2014-12-15-at-3.48.21-pm.png" />
                    <span style={styles.sidebar_name_span}>{props.name}</span>
                </a>
            </div>
    )
}

export default class ChatSidebar extends React.Component {
    render() {
        const styles = {
            chat_sidebar: {
                width: '200px',
                position: 'absolute',
                right: '15px',
                top: '0px',
                paddingTop: '10px',
                paddingBottom: '10px',
                border: '1px solid rgba(29, 49, 91, .3)',
                borderRadius: '4px'
            }
        }

            
        let _contacts = [];
        this.props.onlines.forEach( c => {
            _contacts.push(<Contact id={c.id} name={c.name} handleRegisterPopup={this.props.handleRegisterPopup}/>)
        })

        return ( 
            <Responsive minWidth={768}>
                <div style={styles.chat_sidebar}>
                  {_contacts}
                </div> 
            </Responsive>
        )
    }
}