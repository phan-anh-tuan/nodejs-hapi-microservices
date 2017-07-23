import fetch from 'isomorphic-fetch'
var moment = require('moment');

export const REQUEST_RESOURCE_REQUESTS = 'REQUEST_RESOURCE_REQUESTS'
export const RECEIVE_RESOURCE_REQUESTS = 'RECEIVE_RESOURCE_REQUESTS'
export const REQUEST_RESOURCE_REQUEST = 'REQUEST_RESOURCE_REQUEST'
export const RECEIVE_RESOURCE_REQUEST = 'RECEIVE_RESOURCE_REQUEST'
export const CHANGE_RESOURCE_REQUEST = 'CHANGE_RESOURCE_REQUEST'
export const RESET_ACTIVE_RESOURCE_REQUEST = 'RESET_ACTIVE_RESOURCE_REQUEST'
export const SHOW_REQUEST_COMMENT = 'SHOW_REQUEST_COMMENT'
export const HIDE_REQUEST_COMMENT = 'HIDE_REQUEST_COMMENT'
export const SUBMIT_RESOURCE_REQUEST = 'SUBMIT_RESOURCE_REQUEST'
export const RECEIVE_REQUEST_SUBMISSION = 'RECEIVE_REQUEST_SUBMISSION'
export const ADD_COMMENT_SUCCESSFULLY = 'ADD_COMMENT_SUCCESSFULLY'
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

function shouldFetchRequests(state) {
    if (moment().diff(moment(state.resourceRequests.updatedAt)) / 1000 > 60) { return true; } //refresh data every 60 second
    return (state.resourceRequests.items.length === 0 && !state.resourceRequests.isFetching);
}

function fetchRequests(dispatch) {
    console.log(`resource_requests/actions.js fetching Resource Request`);
    dispatch(RequestResourceRequests());
    return fetch('http://localhost:3000/api/resource/request')
}
/**
 * Fetch a list resource requests
 */
export function fetchResourceRequests(forced = false) {
    const options = {
                        method: 'GET',
                        headers: {
                            'Access-Control-Allow-Origin': '*'
                        },
                    }
    return (dispatch,getState) => {
        console.log(`attempt to refresh resource requests`);
        const state = getState();
        if ((forced && !state.resourceRequests.isFetching) || shouldFetchRequests(state))  {
            return fetchRequests(dispatch).then( response => response.json())
                                    .then( json => {    
                                    dispatch(ReceiveResourceRequests(json));
                                    });
        } else {
            // Let the calling code know there's nothing to wait for.
            return Promise.resolve()
        }
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
        return (dispatch,getState) => {
            const state = getState();
            if (shouldFetchRequests(state)) {
                return fetchRequests(dispatch).then( response => response.json())
                                        .then( json => {    
                                            return dispatch(ReceiveResourceRequests(json));
                                        })
                                        .then((nextState) => {
                                            //console.log(`resource_requests/actions nextState ${JSON.stringify(nextState)}`);
                                            //const datas =  nextState.items.filter((request) => { return request._id === id })
                                            //dispatch(ReceiveResourceRequest(datas.length >0 ? datas[0]: {}));
                                            dispatch(ReceiveResourceRequest(id));
                                        });
            } else {
                //const datas =  state.resourceRequests.items.filter((request) => { return request._id === id;})
                //dispatch(ReceiveResourceRequest(datas.length >0 ? datas[0]: {}));
                dispatch(ReceiveResourceRequest(id));
                return Promise.resolve()
            }
            /*
            dispatch(RequestResourceRequest());
            return fetch(`http://localhost:3000/api/resource/request/${id}`)
                        .then( response => response.json())
                        .then( json => {    
                                        dispatch(ReceiveResourceRequest(json));
                                    });
            */
        }
    } else {
        //console.log(`resource_requests/actions.js trying to reset active request`);
        return { 
            type: RESET_ACTIVE_RESOURCE_REQUEST,
        }
    }
}
export function handleRequestDelete() {
    return (dispatch,getState) => {
        const state = getState();
        const _id = JSON.parse(JSON.stringify(state.resourceRequests.activeRequest.data._id));
        dispatch(submitResourceRequest());
        return fetch(`http://localhost:3000/api/resource/request/${_id}`, 
                {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
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
                                    //console.log('request succeeded with JSON response', json);
                                    dispatch(receiveRequestSubmission());
                                    return dispatch(fetchResourceRequests(true)); })
                .catch( (_error) => {
                    console.log('request fail with error message', error.message);
                    dispatch(receiveRequestSubmission(_error));
                })
    }
}

export function handleRequestSubmit() {
    return (dispatch,getState) => {
        const state = getState();
        const requestBody = JSON.parse(JSON.stringify(state.resourceRequests.activeRequest.data));
        delete requestBody.comments //DO NOT UPDATE comments 
        if (!requestBody.submissionDate) { delete requestBody.submissionDate}
        if (!requestBody.tentativeStartDate) { delete requestBody.tentativeStartDate}
        if (!requestBody.fulfilmentDate) { delete requestBody.fulfilmentDate}
        if (!requestBody.status) { requestBody.status = 'Open'}
        dispatch(submitResourceRequest());
         //console.log('resource_requests/action prepare to submit data', requestBody);
        return fetch('http://localhost:3000/api/resource/request', 
                {
                    method: !!requestBody._id ? 'PUT' : 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestBody)
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
export function ReceiveResourceRequest(id) {
    //console.log(`resource_requests/actions.js receive request ${JSON.stringify(id)}`);
    return {
        type: RECEIVE_RESOURCE_REQUEST,
        id: id
    }
}

export function handleRequestChange(event) {
    const target = event.target;
    //console.log(`resource_requests\action ${target.id} ${target.value}`);
    return {
        type: CHANGE_RESOURCE_REQUEST,
        name: target.id,
        value: target.type === 'checkbox' ? target.checked : target.value
    }
}

export function showRequestComment(id) {
    return {
        type: SHOW_REQUEST_COMMENT,
        id: id
    }
}

export function hideRequestComment(id) {
    return {
        type: HIDE_REQUEST_COMMENT,
        id: id
    }
}

export function addRequestComment(text) {
    return (dispatch,getState) => {
              //TODO: show loading 
            const state = getState();
            const activeRequest = JSON.parse(JSON.stringify(state.resourceRequests.activeRequest.data));
            const payload = Object.assign({}, { _id: activeRequest._id, text: text})
            console.log(`resource_requests\action about to lodge a request ${JSON.stringify(payload)}`);
            return fetch('http://localhost:3000/api/resource/request/comment', 
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                }).then( response => {
                    if (response.status !== 200) {
                        let error = new Error(response.statusText);
                        error.response = response;
                        dispatch(addRequestCommentSuccessfully(error));
                        //throw error;
                    } else {
                        return response.json();
                    }
                }).then( json => { 
                        dispatch(addRequestCommentSuccessfully()); 
                        return dispatch(fetchResourceRequests(true));
                }).catch( (_error) => {
                    console.log('request fail with error message', error.message);
                    dispatch(addRequestCommentSuccessfully(error));
                })     
    }
}

export function addRequestCommentSuccessfully(error = null) {
    return  {
        type: ADD_COMMENT_SUCCESSFULLY,
        error: error
    }
}

export function submitResourceRequest() {
    return {
        type: SUBMIT_RESOURCE_REQUEST
    }
}

export function receiveRequestSubmission(_error = null) {
    return {
        type: RECEIVE_REQUEST_SUBMISSION,
        error: _error
    }
}
