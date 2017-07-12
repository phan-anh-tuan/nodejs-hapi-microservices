import React from 'react'
import { connect } from 'react-redux'
import RequestList from '../../components/resource_requests/request_list.js'
import PropTypes from 'prop-types'
import {fetchResourceRequests} from '../../actions/resource_requests/actions.js';
class VisibleResourceRequestList extends React.Component {
  
  constructor(props) {
      super(props);
  }

  componentWillMount() {
      this.props.fetchResourceRequests();
      this.requestHandler = setInterval(this.props.fetchResourceRequests,60000); //attempt to refresh data every 60 seconds
  }

  componentWillUnmount() {
    if (this.requestHandler) {
        clearInterval(this.requestHandler);
    }
  }

  render() {
    const {isFetching, items, match} = this.props;
    return (<RequestList items={items} isFetching={isFetching} baseUrl={match.url}/>);
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
  return {
    isFetching: state.resourceRequests.isFetching,
    items: getVisibleRequests(state.resourceRequests.items, ownProps.status || 'All'),
    showCommentDialog: state.resourceRequests.isFetching
  }
}


const mapDispatchToProps = (dispatch) => {
  return {
      fetchResourceRequests: () => { dispatch(fetchResourceRequests()) },
      showComment: () => { alert('comment here');}
  }
}

VisibleResourceRequestList.propTypes = {
    items: PropTypes.array.isRequired,
    isFetching: PropTypes.bool.isRequired,
    fetchResourceRequests: PropTypes.func.isRequired
}

export default connect(mapStateToProps,mapDispatchToProps)(VisibleResourceRequestList)