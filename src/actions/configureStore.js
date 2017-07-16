import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';
import { combineReducers } from 'redux';
import { postsBySubreddit, selectedSubreddit} from './Reddit/reducers.js'
import { todos, isFetchingTodos, visibilityFilters} from './Todos/reducers.js'
import { resourceRequests } from './resource_requests/reducers.js'
import { VisibilityFilters } from './Todos/actionTypes.js'
const loggerMiddleware = createLogger();


const initialState = {
    postsBySubreddit: {
        reactjs: {
            isFetching: false,
            didInvalidate: true,
            items: []
        },
        frontend: {
            isFetching: false,
            didInvalidate: true,
            items: []
        }
    },
    selectedSubreddit: 'reactjs',
    todos: [],
    isFetchingTodos: false,
    visibilityFilters: VisibilityFilters.SHOW_ALL,
    resourceRequests: {
      isFetching: false,
      items: [],
      activeRequest: {
          isFetching: false,
          isSubmitting: false,
          showComment: false,
          data: {}
      },
      updatedAt: Date.now()
    }
}

const rootReducer = combineReducers({
    postsBySubreddit,
    selectedSubreddit,
    todos,
    isFetchingTodos,
    visibilityFilters,
    resourceRequests
})

export default function configureStore() {
    return createStore(rootReducer,
                        initialState,
                        applyMiddleware(thunkMiddleware,
                                        loggerMiddleware
                        )
                     )
}
