import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import RequestList from '../components/request_list.js'

import {fetchResourceRequests, showRequestComment, hideRequestComment, addRequestComment, handleCloseRequestWithComment} from '../actions.js';
class VisibleResourceRequestList extends React.Component {
  
  constructor(props) {
      super(props);
  }

  componentWillMount() {
      this.props.fetchResourceRequests();
      //this.requestHandler = setInterval(this.props.fetchResourceRequests,60000); //attempt to refresh data every 60 seconds
  }
  /*
  componentWillUnmount() {
    if (this.requestHandler) {
        clearInterval(this.requestHandler);
    }
  }
*/
  render() {
    const {isFetching, items, match} = this.props;
    //return (<RequestList items={items} isFetching={isFetching} baseUrl={match.url}/>);
    return (<RequestList baseUrl={match.url} {...this.props}/>);
  }
}

function getVisibleRequests(requests, status) {
    switch(status.toLowerCase()) {
        case 'open':
            return requests.filter((item) => { return item.status.toLowerCase() === 'open'})
        case 'closed':
            return requests.filter((item) => { return item.status.toLowerCase() === 'closed'})
        default:
            return requests;
    }
}

const mapStateToProps = (state,ownProps) => {
    //console.log(`visibleResourceRequestList comments ${state.resourceRequests.activeRequest.data.comments}`)
    return {
        isFetching: state.resourceRequests.isFetching,
        items: getVisibleRequests(state.resourceRequests.items, ownProps.status || 'All'),
        showComment: state.resourceRequests.activeRequest.showComment,
        comments: state.resourceRequests.activeRequest.data.comments || []
    }
}


const mapDispatchToProps = (dispatch) => {
  return {
        fetchResourceRequests: (forced,direction) => { dispatch(fetchResourceRequests(forced,direction)) },
        handleShowComment: (id) => { dispatch(showRequestComment(id)) },
        handleHideComment: () => { dispatch(hideRequestComment()) },
        handleAddComment: (id,text) => { return dispatch(addRequestComment(id,text)) },
        handleCloseRequestWithComment: (id,text,status) => { return dispatch(handleCloseRequestWithComment(id,text,status)) },
  }
}

VisibleResourceRequestList.propTypes = {
    items: PropTypes.array.isRequired,
    isFetching: PropTypes.bool.isRequired,
    showComment: PropTypes.bool,
    comments: PropTypes.array,
    fetchResourceRequests: PropTypes.func.isRequired,
    handleShowComment: PropTypes.func.isRequired,
    handleHideComment: PropTypes.func.isRequired,
    handleAddComment: PropTypes.func.isRequired,
    handleCloseRequestWithComment: PropTypes.func.isRequired
}

export default connect(mapStateToProps,mapDispatchToProps)(VisibleResourceRequestList)