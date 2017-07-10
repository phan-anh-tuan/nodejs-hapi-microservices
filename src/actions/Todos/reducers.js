import {ADD_TODO, TOGGLE_TODO, SET_VISIBILITY_FILTER, VisibilityFilters, FETCH_TODOS_SUCCESS, REQUEST_TODO} from './actionTypes';
import "babel-polyfill";
let randomatic = require('randomatic');

/*
const initialState = {
    todos: [],
    visibilityFilters: VisibilityFilters.SHOW_ALL
}
*/

export function todos(state= [], action) {
    switch(action.type) {
        case ADD_TODO:
            return [
                ...state,
                {
                    id: randomatic('0', 10),
                    text: action.text,
                    completed: false
                }
            ];
        case TOGGLE_TODO:
            return state.map((todo,index) => {
                if (todo.id === action.index) {
                    return Object.assign({}, todo, { completed: !todo.completed})
                }
                return todo;
            });
        case FETCH_TODOS_SUCCESS:
            //console.log(`reducers.js ${action.todos}`);
            return action.todos;
            /*[
                ...state,
                action.todos
            ];*/
        default:
            return state;
    }
}

export function visibilityFilters(state= VisibilityFilters.SHOW_ALL, action) {
    switch(action.type) {
        case SET_VISIBILITY_FILTER:
            return action.filter;
        default:
            return state;
    }
}

export function isFetchingTodos(state= false, action) {
    switch(action.type) {
        case REQUEST_TODO:
            return true;
        case FETCH_TODOS_SUCCESS:
            return false;
        default:
            return state;
    }
}
/*
function todoApp(state,action) {
    if (typeof state === 'undefined') {
        return initialState;
    }

    return {
        visibilityFilters: visibilityFilters(state.visibilityFilters,action),
        todos: todos(state.todos,action)
    }
}

export default todoApp;*/
