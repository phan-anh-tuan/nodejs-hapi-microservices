import fetch from 'isomorphic-fetch'

export const REQUEST_RESOURCE_REQUESTS = 'REQUEST_RESOURCE_REQUESTS'
export const RECEIVE_RESOURCE_REQUESTS = 'RECEIVE_RESOURCE_REQUESTS'
export const REQUEST_RESOURCE_REQUEST = 'REQUEST_RESOURCE_REQUEST'
export const RECEIVE_RESOURCE_REQUEST = 'RECEIVE_RESOURCE_REQUEST'
export const RESET_ACTIVE_RESOURCE_REQUEST = 'RESET_ACTIVE_RESOURCE_REQUEST'
/**
 * Request a list resource requests
 */
export function RequestResourceRequests() {
    return {
        type: REQUEST_RESOURCE_REQUESTS
    }
}

/**
 * Request a specific resource request
 */
export function RequestResourceRequest() {
    console.log(`resource_requests/actions.js create RequestResourceRequest`);
    return {
        type: REQUEST_RESOURCE_REQUEST
    }
}

/**
 * Fetch a list resource requests
 */
export function fetchResourceRequests() {
    const options = {
                        method: 'GET',
                        headers: {
                            'Access-Control-Allow-Origin': '*'
                        },
                    }
    return (dispatch) => {
        dispatch(RequestResourceRequests());
        return fetch('http://localhost:3000/api/resource/request')
                    .then( response => response.json())
                    .then( json => {    
                                      dispatch(ReceiveResourceRequests(json));
                                   });
    }
}

/**
 * Fetch a specific resource request
 */
export function fetchResourceRequest(id) {
    if (id && id !== 'create') { 
        const options = {
                            method: 'GET',
                            headers: {
                                'Access-Control-Allow-Origin': '*'
                            },
                        }
        return (dispatch) => {
            dispatch(RequestResourceRequest());
            return fetch(`http://localhost:3000/api/resource/request/${id}`)
                        .then( response => response.json())
                        .then( json => {    
                                        dispatch(ReceiveResourceRequest(json));
                                    });
        }
    } else {
        console.log(`resource_requests/actions.js trying to reset active request`);
        return { 
            type: RESET_ACTIVE_RESOURCE_REQUEST,
        }
    }
}

/**
 * Receive a list of resource requests
 **/
export function ReceiveResourceRequests(items) {
    return {
        type: RECEIVE_RESOURCE_REQUESTS,
        items: items
    }
}

/**
 * Receive a specific resource request
 **/
export function ReceiveResourceRequest(item) {
    console.log(`resource_requests/actions.js receive request ${JSON.stringify(item)}`);
    return {
        type: RECEIVE_RESOURCE_REQUEST,
        data: item
    }
}