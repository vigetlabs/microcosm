import React from 'react'
import { Connect } from '../connect'

function User({ user }) {
  if (user == null) {
    return <p>Loading user</p>
  }

  return (
    <article key={user.id} className="home-post">
      <h2>{user.name}</h2>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </article>
  )
}

export function UsersShow({ match }) {
  let { id } = match.params

  return (
    <Connect source="users.find" params={{ id }}>
      {user => <User user={user} />}
    </Connect>
  )
}
