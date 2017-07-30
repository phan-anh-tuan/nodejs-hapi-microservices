import fetch from 'isomorphic-fetch'
import {ApiEndpoint} from '../api-endpoint'

export const SEND_MESSAGE = 'SEND_MESSAGE'
export const SEND_MESSAGE_RESPONSE = 'SEND_MESSAGE_RESPONSE'

export function sendMessage() {
    return {
        type: SEND_MESSAGE
    }
}

export function sendMessageResponse(response) {
    return {
        type: SEND_MESSAGE_RESPONSE,
        response: response
    }
}

export function handleMessageSubmission(data) {
    return (dispatch,getState) => {
                
        dispatch(sendMessage());
         
        return fetch(`${ApiEndpoint}/contact`, 
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'same-origin',
                    body: JSON.stringify(data)
                })
                .then( response => response.json())
                .then( json => dispatch(sendMessageResponse(json)))
                .catch( (error) => {
                    const response = {};
                    response.error = error;
                    dispatch(sendMessageResponse(response));
                })
    }
}