import { Post } from '../data/post'
import { Collection } from 'micromanage'

export class Posts extends Collection(Post) {
  all(query) {
    return this.fetch(Post.index, query)
  }

  find(params) {
    return this.fetch(Post.show, params)
  }
}
