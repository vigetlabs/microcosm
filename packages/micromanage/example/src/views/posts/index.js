import React from 'react'
import { Connect } from '../cache'
import { Link } from 'react-router-dom'

function Post({ post }) {
  return (
    <article key={post.id} className="home-post">
      <h2>
        <Link to={`/posts/${post.id}`}>{post.title}</Link>
      </h2>
      <div>
        <p>{post.body}</p>
      </div>
    </article>
  )
}

export function PostsIndex() {
  return (
    <div className="home-container">
      <Connect source="posts.all" repeat={true}>
        {post => <Post key={post.id} post={post} />}
      </Connect>
    </div>
  )
}
