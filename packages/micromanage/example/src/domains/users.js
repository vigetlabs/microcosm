import { User } from '../data/user'
import { Collection, RestFactory } from 'micromanage'

export class Users extends Collection(User, RestFactory) {
  all() {
    this.fetch(Users.index)

    return this.asArray()
  }

  find(params) {
    this.fetch(Users.show, params)

    return this.find(params)
  }
}
