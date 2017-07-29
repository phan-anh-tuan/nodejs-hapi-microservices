import fetch from 'isomorphic-fetch'
import {ApiEndpoint} from '../../api-endpoint'
//var moment = require('moment');

export const LOADING = 'LOADING'
export const LOADING_RESPONSE = 'LOADING_RESPONSE'

export function loading() {
    return {
        type: LOADING
    }
}

export function loadingResponse(response) {
    return {
        type: LOADING_RESPONSE,
        response: response
    }
}

export function fetchData(year) {
    return (dispatch,getState) => {
                
        dispatch(loading());
            
        return fetch(`${ApiEndpoint}/resource/request?year=${year}&limit=-1`, 
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        credentials: 'same-origin'
                    })
                    .then( response => response.json())
                    .then( json => dispatch(loadingResponse(json)))
                    .catch( (error) => {
                        console.log('report/actions/requestStatusReport fetch request failed with error message', error.message);
                        const response = {};
                        response.error = error;
                        dispatch(loadingResponse(response));
        })
    }
}