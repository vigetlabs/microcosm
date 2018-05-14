import { Post } from '../data/post'
import { Collection, RestFactory } from 'micromanage'

export class Posts extends Collection(Post, RestFactory) {
  all(query) {
    return this.fetch(Posts.index, query)
  }

  find(params) {
    return this.fetch(Posts.show, params)
  }
}
