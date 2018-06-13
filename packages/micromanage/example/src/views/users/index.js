import React from 'react'
import { Query } from 'microcosm-dom'
import { Link } from 'react-router-dom'

function User({ user }) {
  return (
    <article key={user.id} className="home-post">
      <h2>
        <Link to={`/users/${user.id}`}>{user.name}</Link>
      </h2>
      <p>{user.company.name}</p>
    </article>
  )
}

function Users({ data, loading, error }) {
  if (loading) {
    return <p>Loading users...</p>
  } else if (error) {
    return <p>Unable to load users</p>
  }

  return data.map(user => <User key={user.id} user={user} />)
}

export function UsersIndex() {
  return (
    <div className="home-container">
      <Query source="users.all" render={Users} />
    </div>
  )
}
