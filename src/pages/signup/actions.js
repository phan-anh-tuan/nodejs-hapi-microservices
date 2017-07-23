import fetch from 'isomorphic-fetch'
var moment = require('moment');

export const REGISTER = 'REGISTER'
export const REGISTER_RESPONSE = 'REGISTER_RESPONSE'

export function register() {
    return {
        type: REGISTER
    }
}

export function registerResponse(response) {
    return {
        type: REGISTER_RESPONSE,
        response: response
    }
}

export function handleRegisterRequest(account) {
    return (dispatch,getState) => {
        //const state = getState();
                
        dispatch(register());
         
        return fetch('http://localhost:3000/api/signup', 
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(account)
                })
                .then( response => response.json())
                .then( json => dispatch(registerResponse(json)))
                .catch( (error) => {
                    console.log('signup/actions create account request failed with error message', error.message);
                    const response = {};
                    response.error = error;
                    dispatch(registerResponse(response));
                })
    }
}
