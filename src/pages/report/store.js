import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';
import { combineReducers } from 'redux';

import { requestReport } from './reducers/requestReport.js'

const loggerMiddleware = createLogger();


const initialState = {
    requestReport: {
        loading: false,
        success: false,
        error: undefined,
        hasError: {},
        help: {},
        data: []
    },
}

const rootReducer = combineReducers({
    requestReport
})

export default function store() {
    return createStore(rootReducer,
                        initialState,
                        applyMiddleware(thunkMiddleware,
                                        loggerMiddleware
                        )
                     )
}
