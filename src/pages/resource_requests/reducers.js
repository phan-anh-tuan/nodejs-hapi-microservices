import { REQUEST_RESOURCE_REQUESTS, RECEIVE_RESOURCE_REQUESTS, REQUEST_RESOURCE_REQUEST, RECEIVE_RESOURCE_REQUEST, 
         RESET_ACTIVE_RESOURCE_REQUEST, CHANGE_RESOURCE_REQUEST, SHOW_REQUEST_COMMENT, HIDE_REQUEST_COMMENT,
         SUBMIT_RESOURCE_REQUEST, RECEIVE_REQUEST_SUBMISSION, ADD_COMMENT_SUCCESSFULLY, CLOSE_REQUEST_WITH_COMMENT_SUCCESSFULLY, SET_CURRENT_PAGE } from './actions';
const ParseValidation = require('../../actions/helpers/parse-validation');

function populateActiveRequest(state, id, isFetching = false, isSubmitting = false, showComment = false  ) {
    let datas;
    if (id) {
        datas =  state.items.filter((request) => { return request._id === id;})
    } else {
        datas = []
    }
    return Object.assign({},state,
                                { activeRequest: { isFetching: isFetching,
                                                   isSubmitting: isSubmitting,
                                                   showComment: showComment,  
                                                   data: datas.length >0 ? datas[0]: {},
                                                   success: false,
                                                   error: undefined,
                                                   hasError: {},
                                                   help: {}}
                                });
}

export function resourceRequests(state= {   isFetching: false,
            
                                            items: [], 
                                            page: 1,
                                            year: new Date().getFullYear(),
                                            activeRequest: {    isFetching: false, 
                                                                isSubmitting: false,
                                                                showComment: false,
                                                                success: false,
                                                                error: undefined,
                                                                hasError: {},
                                                                help: {},
                                                                data: {}
                                                            }
                                        }, action) {
    let validation = {}
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
            //return populateActiveRequest(state, null, true, false, false)  
            return Object.assign({},state,
                                { activeRequest: { isFetching: true,
                                                   isSubmitting: false,
                                                   showComment: false,
                                                   success: false,
                                                   error: undefined,
                                                   hasError: {},
                                                   help: {},
                                                   data: {}}
                                });
        case RECEIVE_RESOURCE_REQUEST:
            
            validation = ParseValidation(action.response);
            
            //return populateActiveRequest(state, action.id, false, false, false)  
            return Object.assign({},state,
                                { activeRequest: {  isFetching: false,
                                                    isSubmitting: false,
                                                    showComment: false,
                                                    success: !validation.error && JSON.stringify(validation.hasError) === '{}',
                                                    error: validation.error,
                                                    hasError: validation.hasError,
                                                    help: validation.help,
                                                    data: (!validation.error && JSON.stringify(validation.hasError) === '{}') ? action.response : {}}
                                });
        case SHOW_REQUEST_COMMENT:
            return populateActiveRequest(state, action.id, false, false, true)  
        case HIDE_REQUEST_COMMENT:
            const { showComment, ...__props } = JSON.parse(JSON.stringify(state.activeRequest));
            return Object.assign({},state, { activeRequest: { showComment: false, ...__props} });
        case SUBMIT_RESOURCE_REQUEST:
            const { isSubmitting, ...props } = JSON.parse(JSON.stringify(state.activeRequest));
            return Object.assign({},state, { activeRequest: { isSubmitting: true, ...props} });
        case RECEIVE_REQUEST_SUBMISSION:
            validation = ParseValidation(action.response);
            const { data: _data, ..._props } = JSON.parse(JSON.stringify(state.activeRequest));
            console.log(`resouce_requests reducers state: ${JSON.stringify(state.activeRequest)}`)
            console.log(`resouce_requests reducers _data: ${JSON.stringify(_data)}`)
            return Object.assign({},state, { activeRequest: {   isFetching: false,
                                                                isSubmitting: false,
                                                                showComment: false,
                                                                success: !validation.error && JSON.stringify(validation.hasError) === '{}',
                                                                error: validation.error,
                                                                hasError: validation.hasError,
                                                                help: validation.help,
                                                                data: (!validation.error && JSON.stringify(validation.hasError) === '{}') ? action.response : _data
                                                            }});
        case RESET_ACTIVE_RESOURCE_REQUEST:
            return Object.assign({},state,
                                { activeRequest: {  isFetching: false,
                                                    isSubmitting: false,
                                                    showComment: false,
                                                    success: true,
                                                    error: undefined,
                                                    hasError: {},
                                                    help: {},
                                                    data: {}
                                                }
                                });
        case CHANGE_RESOURCE_REQUEST:
            /************************************************************************************************
            * see warning for Deep Clone
            *    https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
            *************************************************************************************************/            
            const { data, ...rest} = JSON.parse(JSON.stringify(state.activeRequest));
            data[action.name] = action.value;
            return Object.assign({},state, { activeRequest: { data: data, ...rest} });
        case SET_CURRENT_PAGE:
            const currentPage = state.page;
            if (action.direction !== '') {
                return Object.assign({},state, { page: action.direction.toLowerCase() === 'next' ? currentPage + 1 : (currentPage > 1 ? currentPage - 1 : 1)  });
            } else {
                return state;
            }
        case ADD_COMMENT_SUCCESSFULLY:
        case CLOSE_REQUEST_WITH_COMMENT_SUCCESSFULLY:
            /*
            TODO handle exception if (action.error)
            */
        default:
            return state;
    }
}