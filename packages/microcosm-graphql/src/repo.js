import assert from 'assert'
import Microcosm, { set } from 'microcosm'
import Schema from './schema'
import { domainFactory } from './domains'
import { createAccessor, createRelationship } from './queries'
import { select } from './resolve'

class GraphMicrocosm extends Microcosm {
  setup({ schema }) {
    this.schema = new Schema(schema)
    this.mutations = this.schema.mutations()
    this.resolvers = { Query: {}, Mutation: {} }

    this.schema.types().forEach(this.addResource, this)

    for (var key in this.mutations) {
      this.mutations[key].forEach(mutation => {
        const { name } = mutation

        this.resolvers.Mutation[name] = (_root, args) => this.push(name, args)
      })
    }
  }

  addResource(type) {
    if (type === 'Mutation') {
      return
    }

    if (type !== 'Query') {
      let mutations = this.mutations[type]
      let shape = this.schema.shape(type)
      let Domain = domainFactory(this, shape, mutations)

      this.addDomain(type, Domain)
    }

    let def = this.schema.definition(type)

    for (let key in def) {
      let entry = def[key]
      let related = this.schema.has(entry.type)

      if (related) {
        this.resolve(
          [type, key],
          createRelationship(this, this.schema, key, type, entry)
        )
      } else {
        this.resolve([type, key], createAccessor(key))
      }
    }
  }

  resolve(path, resolver) {
    this.resolvers = set(this.resolvers, path, resolver)
  }

  query(document, variables) {
    let context = { variables, resolvers: this.resolvers }

    assert(document.definitions.length, 'This GraphQL document has no queries.')
    assert(document.definitions.length <= 1, 'Too many query definitions.')

    let entry = document.definitions[0]

    return select(this.state, this.schema, entry, context, 'Query')
  }
}

export default GraphMicrocosm
