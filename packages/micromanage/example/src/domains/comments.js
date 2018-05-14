import { Comment } from '../data/comment'
import { Collection, RestFactory } from 'micromanage'

export class Comments extends Collection(Comment, RestFactory) {
  forPost({ post }) {
    return this.fetch(Comments.index, { post })
  }
}
