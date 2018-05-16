import React, { Fragment } from 'react'
import { Link } from 'react-router-dom'

export function Paginator({ page }) {
  return (
    <Fragment>
      <Link
        className="home-pager"
        to={`?_page=${page - 1}`}
        disabled={page <= 1}
      >
        Previous
      </Link>

      <Link className="home-pager" to={`?_page=${page + 1}`}>
        Next
      </Link>
    </Fragment>
  )
}
