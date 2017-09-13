import Microcosm, { set } from 'microcosm'
import Schema from './schema'
import { domainFactory } from './domains'
import { createAccessor, createRelationship } from './queries'
import resolve from './resolve'

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

    let structure = this.schema.structure(type)

    for (let key in structure) {
      let entry = structure[key]

      if (this.schema.structure(entry.type)) {
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
    return resolve(this.schema, document, this.state, variables, this.resolvers)
  }
}

export default GraphMicrocosm
