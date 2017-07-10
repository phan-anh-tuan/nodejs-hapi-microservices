/*
import { connect } from 'react-redux'
import { setVisibilityFilter } from '../actions/actions'


import Link from '../components/link'

const mapStateToProps = (state, ownProps) => {
  return {
    active: ownProps.filter === state.visibilityFilter
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onClick: () => {
      //alert(`filterLink.js - filter = ${ownProps.filter}`);
      dispatch(setVisibilityFilter(ownProps.filter))
    }
  }
}

const FilterLink = connect(
  mapStateToProps,
  mapDispatchToProps
)(Link)

export default FilterLink
*/


import React from 'react'
import { Link } from 'react-router-dom'
const FilterLink = ({ filter, children, href }) => (
  <Link
    to={filter === 'SHOW_ALL' ? `${href}` : `${href}/${filter}`}
    style={{
      textDecoration: 'none',
      color: 'black'
    }}
  >
    {children}
  </Link>
)

export default FilterLink
