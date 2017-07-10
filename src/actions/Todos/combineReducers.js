import { combineReducers } from 'redux';
import * as reducers from './reducers.js'

//console.log(reducers);
const todoApp = combineReducers(reducers)

export default todoApp