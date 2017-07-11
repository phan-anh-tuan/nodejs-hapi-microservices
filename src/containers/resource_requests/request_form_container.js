import React from 'react'
import { connect } from 'react-redux'
import ResourceRequestForm from '../../components/resource_requests/request_form.js'
import {fetchResourceRequest} from '../../actions/resource_requests/actions.js';


const mapStateToProps = (state,ownProps) => {
  const datas =  state.resourceRequests.items.filter((request) => { return request._id === ownProps.match.params.id;})
  return {
    id: ownProps.match.params.id,
    isFetching: state.resourceRequests.activeRequest.isFetching,
    //data: state.resourceRequests.activeRequest.data
    data: datas.length >0 ? datas[0]: {}
  }
}


const mapDispatchToProps = (dispatch) => {
  return {
      fetchResourceRequest: (id) => { dispatch(fetchResourceRequest(id)) }
  }
}

const RequestFormContainer = connect(mapStateToProps,mapDispatchToProps)(ResourceRequestForm)

export default RequestFormContainer