import { updateSnapshot } from '../actions/snapshot'

class Snapshot {
  getInitialState() {
    return {}
  }

  reset(_old, next) {
    return next
  }

  register() {
    return {
      [updateSnapshot]: this.reset
    }
  }
}

export default Snapshot
