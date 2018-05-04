import React from 'react'
import { Request } from '../cache'
import { Link } from 'react-router-dom'

function PostList({ posts }) {
  return posts.map(post => (
    <article key={post.id} className="home-post">
      <h2>
        <Link to={`/posts/${post.id}`}>{post.title}</Link>
      </h2>
      <div>
        <p>{post.body}</p>
      </div>
    </article>
  ))
}

export function PostsIndex() {
  return (
    <div className="home-container">
      <Request source="posts.all">
        {posts => <PostList posts={posts} />}
      </Request>
    </div>
  )
}
