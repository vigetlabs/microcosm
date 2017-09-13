import { resolve } from 'microcosm-graphql'
import { makeRepo } from './repo'
import postsQuery from './posts.gql'

let repo = makeRepo()

function render() {
  let { posts } = resolve(postsQuery, repo.state, {}, repo.resolvers)

  console.clear()
  console.table(posts)

  document.body.innerHTML = `
<ul>
  ${posts.map(a => `<li>${a.title}</li>`).join('\n')}
</ul>
`
}

repo.on('change', render)
render()

setTimeout(function() {
  repo.push('addPost', { id: 1, title: 'OH YEAH', author: '2' })
}, 1000)
