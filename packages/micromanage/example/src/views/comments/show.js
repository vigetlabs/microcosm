import React from 'react'
import { Query } from 'microcosm-dom'

function Comment({ comment }) {
  let { id, name, email, body } = comment

  return (
    <li key={id} className="comment">
      <blockquote>{body}</blockquote>
      <p>
        - <b>{name}</b>, {email}
      </p>
    </li>
  )
}

function CommentList({ data, loading, error }) {
  if (loading) {
    return <p>Loading comments...</p>
  } else if (error) {
    return <p>Unable to load comments</p>
  }

  return data.map(comment => <Comment key={comment.id} comment={comment} />)
}

export function Comments({ post }) {
  return (
    <ul className="comments">
      <Query source="comments.forPost" params={{ post }} render={CommentList} />
    </ul>
  )
}
