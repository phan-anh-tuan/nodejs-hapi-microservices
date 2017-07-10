import React from 'react'
import { connect } from 'react-redux'
import ResourceRequestForm from '../../components/resource_requests/request_form.js'
import {fetchResourceRequest} from '../../actions/resource_requests/actions.js';

const mapStateToProps = (state,ownProps) => {
  return {
    id: ownProps.match.params.id,
    isFetching: state.resourceRequests.activeRequest.isFetching,
    data: state.resourceRequests.activeRequest.data
  }
}


const mapDispatchToProps = (dispatch) => {
  return {
      fetchResourceRequest: (id) => { dispatch(fetchResourceRequest(id)) }
  }
}

const RequestFormContainer = connect(mapStateToProps,mapDispatchToProps)(ResourceRequestForm)

export default RequestFormContainer