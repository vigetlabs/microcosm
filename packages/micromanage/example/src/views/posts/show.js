import React from 'react'
import { Query } from 'microcosm-dom'
import { Comments } from '../comments/show'
import TimeAgo from 'react-timeago'

function Article({ data, loading, error }) {
  if (loading) {
    return <p>Loading article...</p>
  } else if (error) {
    return <p>Failed to load article</p>
  }

  return (
    <article className="post">
      <header>
        <h1>{data.title}</h1>
      </header>

      <p>{data.body}</p>

      <footer>
        <p>
          <i>
            Last requested <TimeAgo date={data._age} /> seconds ago
          </i>
        </p>
      </footer>
    </article>
  )
}

export function PostsShow({ match }) {
  const { id } = match.params

  return (
    <main>
      <Query source="posts.find" params={{ id }} render={Article} />
      <Comments post={id} />
    </main>
  )
}
