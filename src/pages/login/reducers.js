import { LOGIN, LOGIN_RESPONSE, LOGOUT, LOGOUT_RESPONSE, RESET_PASSWORD, RESET_PASSWORD_RESPONSE, FORGOT_PASSWORD, FORGOT_PASSWORD_RESPONSE } from './actions.js'
const ParseValidation = require('../../actions/helpers/parse-validation');

export function login(state= { 
                                    loading: false,
                                    success: false,
                                    error: undefined,
                                    hasError: {},
                                    help: {}
                                }, action) {
    switch (action.type) {
        case LOGIN:
            return Object.assign({},state, { loading: true });
        case LOGIN_RESPONSE:
            //console.log(`login/reducers action.response ${JSON.stringify(action.response)}`);
            const validation = ParseValidation(action.response);
            //console.log(`login/reducers validation ${JSON.stringify(validation)}`);
            return Object.assign({}, state, {
                loading: false,
                success: !!validation.error,
                error: validation.error,
                hasError: validation.hasError,
                help: validation.help
            });
        default:
            return state;
    }
}

export function logout(state= { 
                                    loading: false,
                                    success: false,
                                    error: undefined,
                                    hasError: {},
                                    help: {}
                                }, action) {
    switch (action.type) {
        case LOGOUT:
            return Object.assign({},state, { loading: true });
        case LOGOUT_RESPONSE:
            //console.log(`login/reducers action.response ${JSON.stringify(action.response)}`);
            const validation = ParseValidation(action.response);
            //console.log(`login/reducers validation ${JSON.stringify(validation)}`);
            return Object.assign({}, state, {
                loading: false,
                success: !!validation.error,
                error: validation.error,
                hasError: validation.hasError,
                help: validation.help
            });
        default:
            return state;
    }
}

export function forgot(state= { 
                                    loading: false,
                                    success: false,
                                    error: undefined,
                                    hasError: {},
                                    help: {}
                                }, action) {
    switch (action.type) {
        case FORGOT_PASSWORD:
            return Object.assign({},state, { loading: true });
        case FORGOT_PASSWORD_RESPONSE:
            //console.log(`login/reducers action.response ${JSON.stringify(action.response)}`);
            const validation = ParseValidation(action.response);
            //console.log(`login/reducers validation ${JSON.stringify(validation)}`);
            return Object.assign({}, state, {
                loading: false,
                success: !!validation.error,
                error: validation.error,
                hasError: validation.hasError,
                help: validation.help
            });
        default:
            return state;
    }
}

export function reset(state= { 
                                    loading: false,
                                    success: false,
                                    error: undefined,
                                    hasError: {},
                                    help: {}
                                }, action) {
    switch (action.type) {
        case RESET_PASSWORD:
            return Object.assign({},state, { loading: true });
        case RESET_PASSWORD_RESPONSE:
            //console.log(`login/reducers action.response ${JSON.stringify(action.response)}`);
            const validation = ParseValidation(action.response);
            //console.log(`login/reducers validation ${JSON.stringify(validation)}`);
            return Object.assign({}, state, {
                loading: false,
                success: !!validation.error,
                error: validation.error,
                hasError: validation.hasError,
                help: validation.help
            });
        default:
            return state;
    }
}