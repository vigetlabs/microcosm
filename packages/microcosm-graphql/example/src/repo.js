import { GraphMicrocosm } from '../../src/index'
import schema from './schema.gql'

export function makeRepo(seed) {
  let repo = new GraphMicrocosm({ schema, debug: true, batch: true })

  if (seed) {
    repo.reset({
      Author: [
        { id: '0', name: 'Han Solo' },
        { id: '1', name: 'Princess Leia ' },
        { id: '2', name: 'Luke Skywalker' }
      ],
      Post: [
        { id: '0', title: 'Smuggling', author: '0' },
        { id: '1', title: 'Negotiating', author: '1' },
        { id: '2', title: 'The Force', author: '2' }
      ],
      Comment: [
        { id: '0', content: 'What even?', post: '0' },
        { id: '1', content: 'Terrible!', post: '1' },
        { id: '2', content: 'Nice!', post: '2' }
      ],
      UI: {
        menuOpen: false
      }
    })
  }

  return repo
}
