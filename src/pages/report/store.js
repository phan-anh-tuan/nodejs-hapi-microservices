import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';
import { combineReducers } from 'redux';

import { requestStatusReport } from './reducers/requestStatusReport.js'

const loggerMiddleware = createLogger();


const initialState = {
    requestStatusReport: {
        loading: false,
        success: false,
        error: undefined,
        hasError: {},
        help: {},
        data: []
    },
}

const rootReducer = combineReducers({
    requestStatusReport
})

export default function store() {
    return createStore(rootReducer,
                        initialState,
                        applyMiddleware(thunkMiddleware,
                                        loggerMiddleware
                        )
                     )
}
