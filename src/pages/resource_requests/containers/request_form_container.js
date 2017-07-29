import React from 'react'
import { connect } from 'react-redux'
import ResourceRequestForm from '../components/request_form.js'
import {fetchResourceRequest,handleRequestChange, handleRequestSubmit, handleRequestDelete} from '../actions.js';


const mapStateToProps = (state,ownProps) => {
  //const datas =  state.resourceRequests.items.filter((request) => { return request._id === ownProps.match.params.id;})
  return {
    id: ownProps.match.params.id,
    isFetching: state.resourceRequests.activeRequest.isFetching,
    isSubmitting: state.resourceRequests.activeRequest.isSubmitting,
    data: state.resourceRequests.activeRequest.data,
    success: state.resourceRequests.activeRequest.success,
    error: state.resourceRequests.activeRequest.error,
    hasError: state.resourceRequests.activeRequest.hasError,
    help: state.resourceRequests.activeRequest.help
    //data: datas.length >0 ? datas[0]: {}
  }
}


const mapDispatchToProps = (dispatch) => {
  return {
      fetchResourceRequest: (id) => dispatch(fetchResourceRequest(id)) ,
      handleChange: (event) => { dispatch(handleRequestChange(event))},
      handleSubmit: (isDelete = false) => { if (isDelete) {
                                    return dispatch(handleRequestDelete())
                                  } else {
                                    return dispatch(handleRequestSubmit())
                                  }
                                } /***** how exceptions was handled, should data be populated in mapStateToProps ???***/
  }
}

const RequestFormContainer = connect(mapStateToProps,mapDispatchToProps)(ResourceRequestForm)

export default RequestFormContainer