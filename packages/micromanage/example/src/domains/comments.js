import { Entity, Collection } from 'micromanage'
import { commentSchema, CommentsFactory } from '../data/comment'
import { values, filter } from 'lodash'

export class Comment extends Entity(commentSchema) {}

export class Comments extends Collection(Comment, CommentsFactory) {
  forPost({ post }) {
    this.repo.push(Comments.all, post)

    return this.map(values).map(comments => filter(comments, { postId: post }))
  }
}
