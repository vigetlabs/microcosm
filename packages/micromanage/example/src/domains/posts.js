import { Entity, Collection } from 'micromanage'
import { SubjectMap } from 'microcosm'
import { postSchema, PostsFactory } from '../data/post'
import { values } from 'lodash'

const THIRTY_SECONDS = 30 * 1000

export class Post extends Entity(postSchema) {}

export class Posts extends Collection(Post, PostsFactory) {
  all() {
    return this.fetch(Posts.all)
  }

  find({ id }) {
    this.fetch(Posts.find, id)

    return this.map(next => {
      return next[id]
    })
  }
}
