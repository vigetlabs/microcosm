import React from 'react'
import { Query } from 'microcosm-dom'

function User({ data, loading, error }) {
  if (loading) {
    return <p>Loading user</p>
  } else if (error) {
    return <p>Unable to load user</p>
  }

  return (
    <article key={data.id} className="home-post">
      <h2>{data.name}</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </article>
  )
}

export function UsersShow({ match }) {
  return <Query source="users.find" params={match.params} render={User} />
}
