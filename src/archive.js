/**
 * Keep track of prior task states according to an task's id
 * @constructor
 * @property {Object} pool An object mapping of task ids to snapshots
 */
export default function Archive () {
  this.pool = {}
}

Archive.prototype = {
  /**
   * Create an initial snapshot for an task by setting it to that of its
   * parent.
   * @param {Task} task Task to create an initial snapshot for
   */
  create (task) {
    this.set(task, this.get(task.parent))
  },

  /**
   * Access a prior snapshot for a given task
   * @param {Task} task Task for requested snapshot
   */
  get (task, fallback) {
    console.assert(task, 'Unable to get ' + typeof task + ' task')

    let value = this.pool[task.id]

    return value === undefined ? fallback : value
  },

  /**
   * Assign a new snapshot for an task
   * @param {Task} task Task for requested snapshot
   * @param {Object} snapshot
   */
  set (task, snapshot) {
    this.pool[task.id] = snapshot
  },

  /**
   * Remove a snapshot for an task.
   * @param {Task} task Task to eliminate snapshot for
   */
  remove (task) {
    console.assert(task, 'Unable to remove ' + typeof task + ' task.')

    delete this.pool[task.id]
  }
}
