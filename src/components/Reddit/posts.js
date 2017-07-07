import React from 'react';
import PropTypes from 'prop-types';

class Posts extends React.Component {
    render() {
        return (
            <ul>
                { this.props.posts.map((post,i) =>
                    <li key={i}>{post.title}</li> 
                )}
            </ul>
        )
    }
}

Posts.propTypes = {
    posts: PropTypes.arrayOf(PropTypes.shape({
        title: PropTypes.string.isRequired
    }).isRequired).isRequired
}

export default Posts;
