import React, { Fragment } from 'react'

export function Range({ count, page, total }) {
  let upper = count * page
  let lower = upper - count

  return (
    <Fragment>
      Showing items {lower}&hellip;{upper} of {total} posts
    </Fragment>
  )
}
