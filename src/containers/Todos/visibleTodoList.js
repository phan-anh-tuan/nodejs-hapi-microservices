import { connect } from 'react-redux'
import { fetchTodos, toggleTodo } from '../../actions/Todos/actions'
import TodoList from '../../components/Todos/todoList'


const getVisibleTodos = (todos, filter) => {
  switch (filter) {
    case 'SHOW_COMPLETED':
      return todos.filter(t => t.completed)
    case 'SHOW_ACTIVE':
      return todos.filter(t => !t.completed)
    case 'SHOW_ALL':
    default:
      return todos
  }
}

const mapStateToProps = (state,ownProps) => {
  return {
    isFetchingTodos: state.isFetchingTodos,
    todos: getVisibleTodos(state.todos, ownProps.filter)
    //todos: getVisibleTodos(state.todos, state.visibilityFilters),
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchTodos: () => {
      dispatch(fetchTodos())
    },
    onTodoClick: id => {
      dispatch(toggleTodo(id))
    }
  }
}

const VisibleTodoList = connect(
  mapStateToProps,
  mapDispatchToProps
)(TodoList)

export default VisibleTodoList