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
const repo = makeRepo(true)
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

const restMap = {
  create: 'post',
  delete: 'delete',
  update: 'patch'
}

const crudMap = {
  post: 'add',
  patch: 'update',
  delete: 'remove'
}

for (let key in repo.state) {
  app.get('/' + key.toLowerCase(), function(req, res) {
    res.json(repo.state[key])
  })
}

for (let key in repo.mutations) {
  repo.mutations[key].forEach(function({ operation, name, resource }) {
    if (operation in restMap === false) {
      return
    }

    let method = restMap[operation]
    let action = crudMap[method] + resource
    let url = `/${resource.toLowerCase()}`

    app[method](url, (req, res) => {
      repo.push(action, req.body).then(data => {
        res.json(data)
      }, res.error)
    })
  })
}

app.listen(port, () => {
  console.log('GraphQL listening on http://localhost:%s', port)
})
