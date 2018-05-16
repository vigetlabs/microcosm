import React, { Fragment } from 'react'

export function Range({ count, page, total }) {
  let upper = Math.max(count, count * page)
  let lower = upper - count + 1

  return (
    <Fragment>
      Showing items {lower} through {upper} of {total} posts
    </Fragment>
  )
}
