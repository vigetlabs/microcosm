import Microcosm from 'microcosm'
import { getQueries } from './schema'
import { compile } from './execute'

class GraphMicrocosm extends Microcosm {
  constructor(options) {
    super(options)
    this.schema = getQueries(this.options.schema)
  }

  compile(document) {
    console.assert(
      document.definitions.length,
      'This GraphQL document has no queries.'
    )
    console.assert(
      document.definitions.length <= 1,
      'Too many query definitions.'
    )

    return compile(this.schema, document.definitions[0], this.queries())
  }

  queries() {
    let queries = {}
    for (var key in this.domains._domains) {
      queries[key] = this.domains._domains[key].entity
    }
    return queries
  }

  query(document, variables) {
    return this.compile(document)(this.state, variables)
  }
}

export default GraphMicrocosm
