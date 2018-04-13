import Microcosm from 'microcosm'
import http from 'microcosm-http'
import { delay, testAdapter } from '../test-helpers'

it('fetches', async () => {
  let repo = new Microcosm()

  let getPosts = http.prepare({
    adapter: testAdapter({
      data: [{ id: 0, name: 'My Blog Post' }]
    })
  })

  let posts = await repo.push(getPosts)

  expect(Array.isArray(posts)).toBe(true)
})

it('cancels', async () => {
  let repo = new Microcosm()

  let getPosts = http.prepare({
    adapter: testAdapter()
  })

  let action = repo.push(getPosts)

  await delay(0)

  action.cancel('nevermind')

  expect(action).toHaveProperty('meta.status', 'cancel')
  expect(action).toHaveProperty('payload', 'nevermind')
})

it('errors', async () => {
  let repo = new Microcosm()

  let getPosts = () =>
    http({
      adapter: testAdapter({ status: 400 })
    })

  let action = repo.push(getPosts)

  await delay(0)

  expect(action).toHaveProperty('meta.status', 'error')
})

describe('Downloads', function() {
  it('emits each download event', async () => {
    let repo = new Microcosm()

    let getPosts = http.prepare({
      adapter: testAdapter({
        downloads: [
          { loaded: 0.25, total: 1, lengthComputable: true },
          { loaded: 0.75, total: 1, lengthComputable: true }
        ]
      })
    })

    let action = repo.push(getPosts)
    let updates = []

    action.subscribe({ next: update => updates.push(update) })

    await action

    expect(updates[0].progress).toBeCloseTo(0.25)
    expect(updates[1].progress).toBeCloseTo(0.75)
  })

  it('ignores events where the length is not computable', async () => {
    let repo = new Microcosm()

    let getPosts = http.prepare({
      adapter: testAdapter({
        downloads: [
          { loaded: 0, total: 0, lengthComputable: false },
          { loaded: 0.75, total: 1, lengthComputable: true }
        ]
      })
    })

    let action = repo.push(getPosts)
    let updates = []

    action.subscribe({ next: update => updates.push(update) })

    await action

    expect(updates[0].progress).toBeCloseTo(0.75)
  })
})

describe('Uploads', function() {
  it('handles upload progress', async () => {
    let repo = new Microcosm()

    let getPosts = http.prepare({
      adapter: testAdapter({
        uploads: [
          { loaded: 0.5, total: 1, lengthComputable: true },
          { loaded: 1, total: 1, lengthComputable: true }
        ]
      })
    })

    let action = repo.push(getPosts)
    let updates = []

    action.subscribe({ next: update => updates.push(update) })

    await action

    expect(updates[0].progress).toBeCloseTo(0.5)
    expect(updates[1].progress).toBeCloseTo(1)
  })

  it('ignores events where the length is not computable', async () => {
    let repo = new Microcosm()

    let getPosts = http.prepare({
      adapter: testAdapter({
        uploads: [
          { loaded: 0, total: 0, lengthComputable: false },
          { loaded: 0.75, total: 1, lengthComputable: true }
        ]
      })
    })

    let action = repo.push(getPosts)
    let updates = []

    action.subscribe({ next: update => updates.push(update) })

    await action

    expect(updates[0].progress).toBeCloseTo(0.75)
  })
})
