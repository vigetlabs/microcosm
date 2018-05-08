import { Cache } from '../src/cache'

const action = () => {}

test('caches entries', () => {
  let cache = new Cache()

  cache.set(action, { id: 1 })
})
