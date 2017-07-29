import { REGISTER, REGISTER_RESPONSE } from './actions.js'
const ParseValidation = require('../../actions/helpers/parse-validation');

export function accounts(state= { 
                                    loading: false,
                                    success: false,
                                    error: undefined,
                                    hasError: {},
                                    help: {}
                                }, action) {
    switch (action.type) {
        case REGISTER:
            return Object.assign({},state, { loading: true });
        case REGISTER_RESPONSE:
            //console.log(`signup/reducers action.response ${JSON.stringify(action.response)}`);
            const validation = ParseValidation(action.response);
            //console.log(`signup/reducers validation ${JSON.stringify(validation)}`);
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
}