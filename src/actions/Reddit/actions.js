import fetch from 'isomorphic-fetch'

export const REQUEST_POSTS = 'REQUEST_POSTS'
export const RECEIVE_POSTS = 'RECEIVE_POSTS'
export const SELECT_SUBREDDIT = 'SELECT_SUBREDDIT'
export const INVALIDATE_SUBREDDIT = 'INVALIDATE_SUBREDDIT'

export function selectSubReddit(subreddit) {
    return {
        type: SELECT_SUBREDDIT,
        subreddit
    }
}

export function invalidateSubReddit(subreddit) {
    return {
        type: INVALIDATE_SUBREDDIT,
        subreddit
    }
}

function requestPosts(subreddit) {
    return {
        type: REQUEST_POSTS,
        subreddit
    }
}

function receivePosts(subreddit,json) {
    return {
        type: RECEIVE_POSTS,
        subreddit,
        posts: json.data.children.map(node => node.data),
        receivedAt: Date.now()
    }
}

function fetchPosts(subreddit) {
    return dispatch => {
        dispatch(requestPosts(subreddit));
        return fetch(`https://www.reddit.com/r/${subreddit}.json`)
                .then(response => response.json())
                .then(json => dispatch(receivePosts(subreddit,json)))
    }
}

function shouldFetchPosts(state,subreddit) {
    const posts = state.postsBySubreddit[subreddit];
    if (!posts) {
        return true;
    } else if (posts.isFetching) {
        return false;
    } else {
        return posts.didInvalidate;
    }
}

export function fetchPostsIfNeeded(subreddit) {
    //console.log(getState);
    return (dispatch, getState) => {
        if (shouldFetchPosts(getState(),subreddit)) {
            return dispatch(fetchPosts(subreddit))
        }
    }
}