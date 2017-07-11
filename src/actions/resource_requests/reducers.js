import { REQUEST_RESOURCE_REQUESTS, RECEIVE_RESOURCE_REQUESTS, REQUEST_RESOURCE_REQUEST, RECEIVE_RESOURCE_REQUEST, RESET_ACTIVE_RESOURCE_REQUEST } from './actions';

export function resourceRequests(state= {   isFetching: false,
                                            items: [], 
                                            activeRequest: { isFetching: false, data: {}}}, action) {
    switch (action.type) {
        case REQUEST_RESOURCE_REQUESTS:
            return Object.assign({},state,{ isFetching: true });
        case RECEIVE_RESOURCE_REQUESTS:
            return Object.assign({},state,
                                {   isFetching: false,
                                    items: action.items,
                                    updatedAt: Date.now()
                                });
        case REQUEST_RESOURCE_REQUEST:
            return Object.assign({},state,
                                { activeRequest: { isFetching: true,
                                                   data: {}}
                                });
        case RECEIVE_RESOURCE_REQUEST:
            return Object.assign({},state,
                                { activeRequest: { isFetching: false,
                                                   data: action.data}
                                });
        case RESET_ACTIVE_RESOURCE_REQUEST:
            return Object.assign({},state,
                                { activeRequest: { isFetching: false,
                                                   data: {}}
                                });
        default:
            return state;
    }
}