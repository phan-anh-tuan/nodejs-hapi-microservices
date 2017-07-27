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