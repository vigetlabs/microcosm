import ActionQueue from 'microcosm/addons/action-queue'
import Microcosm from 'microcosm'

describe('ActionQueue', function() {
  it('automatically removes stale actions', function() {
    let repo = new Microcosm()
    let queue = new ActionQueue()

    let action = repo.append('test')

    queue.push(action)

    expect(queue.size()).toBe(1)
    action.resolve()
    expect(queue.size()).toBe(0)
  })
})
