import React from 'react'
import Form from 'react-jsonschema-form'
import { Presenter } from 'microcosm-dom'
import { Request } from '../cache'
import { Link } from 'react-router'
import TimeAgo from 'react-timeago'

function Article({ post }) {
  return (
    <article className="post">
      <header>
        <h1>{post.title}</h1>
      </header>

      <p>{post.body}</p>

      <footer>
        <p>
          <i>
            Last requested <TimeAgo date={post._age} /> seconds ago
          </i>
        </p>
      </footer>
    </article>
  )
}

export function PostsShow({ match }) {
  const { id } = match.params

  return (
    <Request source="posts.find" params={{ id }}>
      {post => {
        if (post == null) {
          return <p>Loading...</p>
        }

        return <Article post={post} />
      }}
    </Request>
  )
}
