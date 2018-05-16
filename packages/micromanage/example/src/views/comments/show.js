import React from 'react'
import { Connect } from 'microcosm-dom'

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

function CommentList({ data }) {
  return data.map(comment => <Comment key={comment.id} comment={comment} />)
}

export function Comments({ post }) {
  return (
    <ul className="comments">
      <Connect
        source="comments.forPost"
        params={{ post }}
        render={CommentList}
      />
    </ul>
  )
}
