import React from 'react'
import { Connect } from '../cache'

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

export function Comments({ post }) {
  return (
    <ul className="comments">
      <Connect source="comments.forPost" params={{ post }} repeat={true}>
        {comment => <Comment key={comment.id} comment={comment} />}
      </Connect>
    </ul>
  )
}
