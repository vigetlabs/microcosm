import { Microcosm } from 'microcosm'
import { Posts } from './domains/posts'
import { Comments } from './domains/comments'
import { Users } from './domains/users'

export class Repo extends Microcosm {
  setup() {
    this.addDomain('posts', Posts)
    this.addDomain('comments', Comments)
    this.addDomain('users', Users)
  }
}
