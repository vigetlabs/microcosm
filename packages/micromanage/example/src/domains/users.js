import { User } from '../data/user'
import { Collection } from 'micromanage'

export class Users extends Collection(User) {
  all() {
    return this.fetch(User.index)
  }

  find(params) {
    return this.fetch(User.show, params)
  }
}
