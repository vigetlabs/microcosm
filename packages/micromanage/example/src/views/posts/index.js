import React from 'react'
import { Connect } from 'microcosm-dom'
import { Link } from 'react-router-dom'
import { Paginator } from './paginator'
import { Range } from './range'

function Post({ post }) {
  return (
    <article key={post.id} className="home-post">
      <h2>
        <Link to={`/posts/${post.id}`}>{post.title}</Link>
      </h2>
      <p>{post.body}</p>
    </article>
  )
}

function Posts({ data, page, total }) {
  let count = data.length

  return (
    <section className="home-container">
      <header className="home-meta">
        <Range page={page} total={total} count={count} />
      </header>

      {data.map(post => <Post key={post.id} post={post} />)}

      <footer className="home-meta">
        <Paginator page={page} />
      </footer>
    </section>
  )
}

export function PostsIndex({ location }) {
  let params = new URLSearchParams(location.search)

  let _page = parseInt(params.get('_page')) || 1
  let _limit = parseInt(params.get('_limit')) || 10

  return (
    <Connect source="posts.all" params={{ _page, _limit }} render={Posts} />
  )
}
