import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';
import { combineReducers } from 'redux';

import { login, logout, forgot, reset } from './reducers.js'

const loggerMiddleware = createLogger();


const initialState = {
    login: {
        loading: false,
        success: false,
        error: undefined,
        hasError: {},
        help: {}
    },
    logout: {
        loading: false,
        success: false,
        error: undefined,
        hasError: {},
        help: {}
    },
    forgot: {
        loading: false,
        success: false,
        error: undefined,
        hasError: {},
        help: {}
    },
    reset: {
        loading: false,
        success: false,
        error: undefined,
        hasError: {},
        help: {}
    }
}

const rootReducer = combineReducers({
    login,
    forgot,
    reset,
    logout
})

export default function store() {
    return createStore(rootReducer,
                        initialState,
                        applyMiddleware(thunkMiddleware,
                                        loggerMiddleware
                        )
                     )
}
