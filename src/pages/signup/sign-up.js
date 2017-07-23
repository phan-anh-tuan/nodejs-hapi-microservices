import React from 'react'
import { Provider } from 'react-redux'

import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';
import { combineReducers } from 'redux';
import { accounts } from './reducers.js'


import SignUpForm from '../../../src/components/accounts/sign-up-form.js'
const loggerMiddleware = createLogger();

const initialState = {
    accounts: {
        form: {
            loading: false,
            success: false,
            error: undefined,
            hasError: {},
            help: {}
        }
    }
}

const rootReducer = combineReducers({
    accounts
})

const store = createStore(rootReducer,
                        initialState,
                        applyMiddleware(thunkMiddleware,
                                        loggerMiddleware
                        )
                     );

export default class SignUpPage extends React.Component {
    render() {
        return (
            <Provider store={store}>
               <SignUpForm/>
            </Provider>                
        )
    }
}