import React from 'react'
import Footer from '../../components/Todos/footer'
import AddTodo from './addTodo.js'
import VisibleTodoList from './visibleTodoList'

const App = ({ match }) => { 
  //console.log(`app.js ${JSON.stringify(match)}`);
  return (
    <div>
      <AddTodo />
      <VisibleTodoList filter={ (match.params && match.params.filter) || 'SHOW_ALL'}/>
      <Footer  href={match.params && match.params.filter ? match.url.slice(0,-1*(match.params.filter.length+1)) : match.url} />
    </div>
)}


export default App