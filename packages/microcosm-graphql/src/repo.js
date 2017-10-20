import Microcosm from 'microcosm'
import { getQueries, getMutations } from './schema'
import { domainFactory } from './domains'
import { execute, compile } from './execute'

class GraphMicrocosm extends Microcosm {
  setup({ schema }) {
    this.schema = getQueries(schema)
    this.mutations = getMutations(this.schema)

    for (var name in this.schema) {
      this.addResource(this.schema[name])
    }
  }

  addResource(definition) {
    const { name, fields } = definition

    if (name === 'Mutation' || name === 'Query') {
      return
    }

    this.addDomain(name, domainFactory(this, definition, this.mutations[name]))
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

    return compile(this, this.schema, document.definitions[0], this.queries)
  }

  query(document, variables) {
    return this.compile(document)(this.state, variables)
  }
}

export default GraphMicrocosm
