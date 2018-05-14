import React from 'react'
import { Connect } from '../connect'
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

export class PostsIndex extends React.Component {
  state = {
    page: 1
  }

  render() {
    let params = new URLSearchParams(this.props.location.search)
    let _page = parseInt(params.get('_page')) || 1

    return (
      <div className="home-container">
        <Connect source="posts.all" params={{ _page }} repeat={true}>
          {post => <Post key={post.id} post={post} />}
        </Connect>
        <Link to={`?_page=${_page + 1}`}>Page {_page + 1}</Link>
      </div>
    )
  }
}
