import { visit } from '../actions/routing'

class Routing {
  setup(repo, { history }) {
    this.history = history
  }

  visitRoute(repo, route) {
    this.history.push(route)
  }

  register() {
    return {
      [visit]: this.visitRoute
    }
  }
}

export default Routing
