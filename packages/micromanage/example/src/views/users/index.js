import React from 'react'
import { Connect } from '../connect'
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

export function UsersIndex() {
  return (
    <div className="home-container">
      <Connect source="users.all" repeat={true}>
        {user => <User key={user.id} user={user} />}
      </Connect>
    </div>
  )
}
