import { push } from '../actions/routing'

class Routing {
  setup(repo, { history }) {
    this.history = history
  }

  handlePush(repo, route) {
    this.history.push(route)
  }

  register() {
    return {
      [push]: this.handlePush
    }
  }
}

export default Routing
