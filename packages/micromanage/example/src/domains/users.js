import { Entity, Collection } from 'micromanage'
import { userSchema, UsersFactory } from '../data/user'
import { values } from 'lodash'

const THIRTY_SECONDS = 30 * 1000

export class User extends Entity(userSchema) {}

export class Users extends Collection(User, UsersFactory) {
  cached(id) {
    return id in this.payload && (Date.now() - this.payload[id]._age) < THIRTY_SECONDS
  }

  all() {
    this.repo.push(Users.all)

    return this.map(values)
  }

  find({ id }) {
    if (this.cached(id) === false) {
      this.repo.push(Users.find, id)
    }

    return this.map(next => {
      return next[id]
    })
  }
}
