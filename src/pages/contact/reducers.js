import { SEND_MESSAGE, SEND_MESSAGE_RESPONSE } from './actions.js'
const ParseValidation = require('../../actions/helpers/parse-validation');
const rootReducer = function (state = { loading: false,
                                        success: false,
                                        error: undefined,
                                        hasError: {},
                                        help: {}}, 
                            action) {
    switch(action.type) {
        case SEND_MESSAGE:
            return Object.assign({}, state, { loading: true });
        case SEND_MESSAGE_RESPONSE:
            const validation = ParseValidation(action.response);

            return Object.assign({}, state, {
                loading: false,
                success: !validation.error && JSON.stringify(validation.hasError) === '{}',
                error: validation.error,
                hasError: validation.hasError,
                help: validation.help
            });
        default:
            return state;
    }
};

export default rootReducer;