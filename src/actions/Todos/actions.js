import fetch from 'isomorphic-fetch'
import {ADD_TODO, TOGGLE_TODO, SET_VISIBILITY_FILTER, FETCH_TODOS_SUCCESS, REQUEST_TODO} from './actionTypes'


export const addTodo = (text) => {
    return {
        type: ADD_TODO,
        text: text
    }
}

export const toggleTodo = (id) => {
    return {
        type: TOGGLE_TODO,
        index: id
    }
}

export const setVisibilityFilter = (filter) => {
    return {
        type: SET_VISIBILITY_FILTER,
        filter: filter
    }
}


function RequestTodos() {
    return {
        type: REQUEST_TODO
    }
}

export function fetchTodos() {
    const options = {
                        method: 'GET',
                        headers: {
                                    'Access-Control-Allow-Origin': '*'
                                    },
                    }
    return (dispatch) => {
        dispatch(RequestTodos());
        return fetch('http://localhost:3000/assets/data.json')
                    .then( response => response.text())
                    .then( text => {    
                                        let json = JSON.parse(text);
                                        setTimeout(()=> dispatch(fetchTodosSuccess(json.todos)), 1000);
                                   });
    }
}

export function fetchTodosSuccess(todos) {
    return {
        type: FETCH_TODOS_SUCCESS,
        todos: todos
    }
}