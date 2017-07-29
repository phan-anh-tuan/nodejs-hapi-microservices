import { LOADING, LOADING_RESPONSE } from '../actions/requestReport.js'
const ParseValidation = require('../../../actions/helpers/parse-validation');

export function requestReport(state= { 
                                    loading: false,
                                    success: false,
                                    error: undefined,
                                    hasError: {},
                                    help: {},
                                    data: []
                                }, action) {
    switch (action.type) {
        case LOADING:
            return Object.assign({},state, { loading: true });
        case LOADING_RESPONSE:
            //console.log(`report/reducers/requestStatusReport action.response ${JSON.stringify(action.response)}`);
            const validation = ParseValidation(action.response);
            //console.log(`report/reducers/requestStatusReport validation ${JSON.stringify(validation)}`);
            return Object.assign({}, state, {
                loading: false,
                success: !validation.error && JSON.stringify(validation.hasError) === '{}',
                error: validation.error,
                hasError: validation.hasError,
                help: validation.help,
                data: (!validation.error) ? action.response : []
            });
        default:
            return state;
    }
}
