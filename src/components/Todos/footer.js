import React from 'react'
import FilterLink from '../../containers/Todos/filterLink'
/*
const Footer = () => (
  <p>
    Show:
    {' '}
    <FilterLink filter="SHOW_ALL">
      All
    </FilterLink>
    {', '}
    <FilterLink filter="SHOW_ACTIVE">
      Active
    </FilterLink>
    {', '}
    <FilterLink filter="SHOW_COMPLETED">
      Completed
    </FilterLink>
  </p>
)

export default Footer
*/

const Footer = (props) => (
  <p>
    Show:
    {' '}
    <FilterLink href={props.href} filter="SHOW_ALL">
      All
    </FilterLink>
    {', '}
    <FilterLink href={props.href} filter="SHOW_ACTIVE">
      Active
    </FilterLink>
    {', '}
    <FilterLink href={props.href} filter="SHOW_COMPLETED">
      Completed
    </FilterLink>
  </p>
)

export default Footer