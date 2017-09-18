import Microcosm from 'microcosm'
import http from '../src/http'

it('fetches', async () => {
  let repo = new Microcosm()

  let getPosts = http({
    url: 'https://jsonplaceholder.typicode.com/posts'
  })

  let posts = await repo.push(getPosts)

  expect(Array.isArray(posts)).toBe(true)
})

it('cancels', () => {
  let repo = new Microcosm()

  let getPosts = http({
    url: 'https://jsonplaceholder.typicode.com/posts'
  })

  let action = repo.push(getPosts)

  action.cancel()

  expect(action.payload).toEqual({
    url: 'https://jsonplaceholder.typicode.com/posts'
  })

  expect(action.status).toBe('cancel')
})
