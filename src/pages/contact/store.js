import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';
import rootReducer from './reducers.js'

const loggerMiddleware = createLogger();


const initialState = {
    loading: false,
    success: false,
    error: undefined,
    hasError: {},
    help: {}
}

export default function store() {
    return createStore(rootReducer,
                        initialState,
                        applyMiddleware(thunkMiddleware,
                                        loggerMiddleware
                        )
                     )
}
