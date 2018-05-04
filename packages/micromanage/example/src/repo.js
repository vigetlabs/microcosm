import { Microcosm } from 'microcosm'
import { Posts } from './domains/posts'

export class Repo extends Microcosm {
  setup() {
    this.addDomain('posts', Posts)
  }
}
