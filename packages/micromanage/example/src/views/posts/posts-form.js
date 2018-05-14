import React from 'react'
import Form from 'react-jsonschema-form'
import { Presenter } from 'microcosm-dom'
import { Post, Posts } from '../domains/posts'
import { Connect } from './connect'

export class PostsForm extends Presenter {
  render() {
    return (
      <div>
        <Form schema={Post.schema} onSubmit={this.onSubmit} />

        <Connect repo={this.repo} source="posts.all">
          {posts => this.renderList(posts)}
        </Connect>
      </div>
    )
  }

  renderList = (posts = []) => {
    return <ul>{posts.map(p => <li key={p.id}>{p.title}</li>)}</ul>
  }

  onSubmit = ({ formData }) => {
    this.repo.push(Posts.create, formData)
  }
}
