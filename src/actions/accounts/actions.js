import fetch from 'isomorphic-fetch'
var moment = require('moment');

export const REGISTER = 'REGISTER'
export const REGISTER_RESPONSE = 'REGISTER_RESPONSE'

export function register() {
    return {
        type: REGISTER
    }
}

export function registerResponse(error) {
    return {
        type: REGISTER_RESPONSE,
        error: error
    }
}

export function handleRegisterRequest(account) {
    return (dispatch,getState) => {
        const state = getState();
        const { name, email, username, password } = account;
                
        dispatch(register());
         
        return fetch('http://localhost:3000/api/signup', 
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: { name, email, username, password }
                }).then( response => {
                    if (response.status !== 200) {
                        let error = new Error(response.statusText);
                        error.response = response;
                        dispatch(receiveRequestSubmission(error));
                        //throw error;
                    } else {
                        
                        return response.json();
                    }
                }).then( json => { 
                                    console.log('request succeeded with JSON response', json);
                                    dispatch(receiveRequestSubmission());
                                    return dispatch(fetchResourceRequests(true)); })
                .catch( (_error) => {
                    console.log('request fail with error message', error.message);
                    dispatch(receiveRequestSubmission(_error));
                })
    }
}
