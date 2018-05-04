import { Entity, Collection } from 'micromanage'
import { postSchema, PostsFactory } from '../data/post'
import { values } from 'lodash'

const THIRTY_SECONDS = 30 * 1000

export class Post extends Entity(postSchema) {}

export class Posts extends Collection(Post, PostsFactory) {
  cached(id) {
    return id in this.payload && (Date.now() - this.payload[id]._age) < THIRTY_SECONDS
  }

  all() {
    this.repo.push(Posts.all)

    return this.map(values)
  }

  find({ id }) {
    if (this.cached(id) === false) {
      this.repo.push(Posts.find, id)
    }

    return this.map(next => {
      return next[id]
    })
  }
}
