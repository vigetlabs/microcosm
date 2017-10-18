import Microcosm, { set } from 'microcosm'
import { getQueries, getMutations } from './schema'
import { domainFactory } from './domains'
import { createRelationship, createFinder } from './default-resolvers'
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

    let mutations = this.mutations[name]

    this.addDomain(name, domainFactory(this, definition, mutations))

    let resolvers = {}

    for (let key in fields) {
      let field = fields[key]
      let related = this.schema[field.type]

      if (related) {
        resolvers[key] = {
          resolver: createRelationship(related, field, key, name)
        }
      }
    }

    this.addQuery(name, resolvers)
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
