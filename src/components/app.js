import React from 'react'
import Footer from './footer'
import AddTodo from '../containers/addTodo.js'
import VisibleTodoList from '../containers/visibleTodoList'

const App = ({ match }) => { 
  //console.log(`app.js ${JSON.stringify(match)}`);
  return (
    <div>
      <AddTodo />
      <VisibleTodoList filter={ (match.params && match.params.filter) || 'SHOW_ALL'}/>
      <Footer />
    </div>
)}


export default App