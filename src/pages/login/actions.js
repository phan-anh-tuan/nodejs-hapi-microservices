//import fetch from 'isomorphic-fetch'
import 'whatwg-fetch'
var moment = require('moment');
import {ApiEndpoint} from '../api-endpoint'

export const LOGIN = 'LOGIN'
export const LOGIN_RESPONSE = 'LOGIN_RESPONSE'
export const LOGOUT = 'LOGOUT'
export const LOGOUT_RESPONSE = 'LOGOUT_RESPONSE'
export const RESET_PASSWORD = 'RESET_PASSWORD'
export const RESET_PASSWORD_RESPONSE = 'RESET_PASSWORD_RESPONSE'
export const FORGOT_PASSWORD = 'FORGOT_PASSWORD'
export const FORGOT_PASSWORD_RESPONSE = 'FORGOT_PASSWORD_RESPONSE'


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
         
        return fetch(`${ApiEndpoint}/login`, 
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
            
        return fetch(`${ApiEndpoint}/logout`, 
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



export function resetPassword() {
    return {
        type: RESET_PASSWORD
    }
}

export function resetPasswordResponse(response) {
    return {
        type: RESET_PASSWORD_RESPONSE,
        response: response
    }
}

export function handleResetPasswordRequest(document) {
    return (dispatch,getState) => {
                
        dispatch(resetPassword());
            
        return fetch(`${ApiEndpoint}/login/reset`, 
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        credentials: 'same-origin',
                        body: JSON.stringify(document)
                    })
                    .then( response => response.json())
                    .then( json => dispatch(resetPasswordResponse(json)))
                    .catch( (error) => {
                        console.log('login/actions reset password request failed with error message', error.message);
                        const response = {};
                        response.error = error;
                        dispatch(resetPasswordResponse(response));
        })
    }
}

export function forgotPassword() {
    return {
        type: FORGOT_PASSWORD    
    }
}

export function forgotPasswordResponse(response) {
    return {
        type: FORGOT_PASSWORD_RESPONSE,
        response: response
    }
}

export function handleForgotPasswordRequest(email) {
    return (dispatch,getState) => {
                
        dispatch(forgotPassword());
            
        return fetch(`${ApiEndpoint}/login/forgot`, 
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        credentials: 'same-origin',
                        body: JSON.stringify({email})
                    })
                    .then( response => response.json())
                    .then( json => dispatch(forgotPasswordResponse(json)))
                    .catch( (error) => {
                        console.log('login/actions forgot password request failed with error message', error.message);
                        const response = {};
                        response.error = error;
                        dispatch(forgotPasswordResponse(response));
        })
    }
}