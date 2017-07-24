import fetch from 'isomorphic-fetch'
var moment = require('moment');

export const LOGIN = 'LOGIN'
export const LOGIN_RESPONSE = 'LOGIN_RESPONSE'
export const LOGOUT = 'LOGOUT'
export const LOGOUT_RESPONSE = 'LOGOUT_RESPONSE'
export const RESET = 'RESET'
export const RESET_RESPONSE = 'RESET_RESPONSE'
export const FORGOT = 'FORGOT'
export const FORGOT_RESPONSE = 'FORGOT_RESPONSE'


export function login() {
    return {
        type: LOGIN
    }
}

export function loginResponse(response) {
    return {
        type: LOGIN_RESPONSE,
        response: response
    }
}

export function handleLoginRequest(account) {
    return (dispatch,getState) => {
        //const state = getState();
                
        dispatch(login());
         
        return fetch('http://localhost:3000/api/login', 
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'same-origin',
                    body: JSON.stringify(account)
                })
                .then( response => response.json())
                .then( json => dispatch(loginResponse(json)))
                .catch( (error) => {
                    console.log('login/actions login request failed with error message', error.message);
                    const response = {};
                    response.error = error;
                    dispatch(loginResponse(response));
                })
    }
}


export function logout() {
    return {
        type: LOGOUT
    }
}

export function logoutResponse(response) {
    return {
        type: LOGOUT_RESPONSE,
        response: response
    }
}

export function handleLogoutRequest() {
    return (dispatch,getState) => {
                
        dispatch(logout());
            
        return fetch('http://localhost:3000/api/logout', 
                    {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        credentials: 'same-origin'
                    })
                    .then( response => response.json())
                    .then( json => dispatch(logoutResponse(json)))
                    .catch( (error) => {
                        console.log('login/actions logout request failed with error message', error.message);
                        const response = {};
                        response.error = error;
                        dispatch(logoutResponse(response));
        })
    }
}    



export function reset() {
    return {
        type: RESET
    }
}

export function resetResponse(response) {
    return {
        type: RESET_RESPONSE,
        response: response
    }
}

export function handleResetRequest() {}

export function forgot() {
    return {
        type: FORGOT    
    }
}

export function forgotResponse(response) {
    return {
        type: FORGOT_RESPONSE,
        response: response
    }
}

export function handleForgotRequest() {}