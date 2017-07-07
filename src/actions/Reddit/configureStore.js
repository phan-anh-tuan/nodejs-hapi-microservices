import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';
import { combineReducers } from 'redux';
import { postsBySubreddit, selectedSubreddit} from './reducers.js'
import { todos, isFetchingTodos, visibilityFilters} from '../reducers.js'

const loggerMiddleware = createLogger();

const rootReducer = combineReducers({
    postsBySubreddit,
    selectedSubreddit,
    todos,
    isFetchingTodos,
    visibilityFilters
})

export default function configureStore(preloadedState) {
    return createStore(rootReducer,
                        preloadedState,
                        applyMiddleware(thunkMiddleware,
                                        loggerMiddleware
                        )
                     )
}
