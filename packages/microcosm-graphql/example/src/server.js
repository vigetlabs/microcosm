'use strict'

import express from 'express'
import bodyParser from 'body-parser'
import { graphqlExpress, graphiqlExpress } from 'graphql-server-express'
import { makeExecutableSchema } from 'graphql-tools'
import { makeRepo } from './repo'
import { stringify } from 'querystring'
import typeDefs from './schema.gql'
import gql from 'graphql-tag'
import morgan from 'morgan'
const repo = makeRepo()
const schema = makeExecutableSchema({ typeDefs, resolvers: repo.resolvers })
const app = express()
const port = process.env.PORT || 4000

app.use(express.static('example/build'))
app.set('json spaces', 2)
app.use(bodyParser.json())
app.use(morgan('tiny'))

app.get('/favicon.ico', (req, res) => {
  res.status(404).send('Not found')
})

app.use(
  '/graphql',
  bodyParser.json(),
  graphqlExpress({
    schema,
    pretty: true,
    context: { repo }
  })
)

app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }))

function getArguments(args) {
  if (args) {
    return `(${stringify(args, ',', ':', {
      encodeURIComponent: n => n
    })})`
  }

  return ''
}

function getFields(fields) {
  return fields ? `{${fields}}` : ''
}

app.get('/:query', (req, res) => {
  let args = getArguments(req.query.args)
  let fields = getFields(req.query.fields)
  let query = gql`query {
    ${req.params.query}${args}${fields}
  }`

  res.json(repo.query(query))
})

const methodMap = {
  add: 'post',
  create: 'post',
  remove: 'delete',
  delete: 'delete',
  update: 'patch'
}

for (let key in repo.mutations) {
  repo.mutations[key].forEach(function({ operation, name, resource }) {
    let method = methodMap[operation]

    app[method](resource.toLowerCase(), (req, res) => {
      var action = repo.push(action, req.body)
      action.then(data => res.json(data), res.error)
    })
  })
}

app.listen(port, () => {
  console.log('GraphQL listening on http://localhost:%s', port)
})
