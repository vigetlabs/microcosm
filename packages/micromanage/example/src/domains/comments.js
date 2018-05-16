import { Comment } from '../data/comment'
import { Collection } from 'micromanage'

export class Comments extends Collection(Comment) {
  forPost({ post }) {
    return this.fetch(Comment.index, { post })
  }
}
