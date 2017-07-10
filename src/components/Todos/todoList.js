import React from 'react';
import PropTypes from 'prop-types';
import Todo from './todo'
/*
const TodoList = ({todos, onTodoClick}) => {
    return (<ul>
        {todos.map((todo,index)=>{
            return <Todo key={todo.id} {...todo} onClick={ () => { onTodoClick(todo.id)}}/>;
        })}
    </ul>);
}
*/

class TodoList extends React.Component {
    componentWillMount() {
        //console.log(`todoList ${this.props.fetchTodos}`);
        this.props.fetchTodos();
    }
    render() {
        const {todos, onTodoClick, isFetchingTodos} = this.props;
        return (
            <div>
                {isFetchingTodos && <h2>Loading....</h2>}
                <ul>
                    {todos.map((todo,index)=>{
                        return <Todo key={todo.id} {...todo} onClick={ () => { onTodoClick(todo.id)}}/>;
                    })}
                </ul>
            </div>
        );
    }
}
TodoList.propTypes = {
    todos: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            completed: PropTypes.bool.isRequired,
            text: PropTypes.string.isRequired
        }).isRequired
    ).isRequired,
    onTodoClick: PropTypes.func.isRequired,
    fetchTodos: PropTypes.func.isRequired,
}
export default TodoList;