/**
 * Sync - Microcosm GraphQL provides default implementations of mutations.
 */

import http from 'microcosm-http'
import { record, passThrough, append, remove, update } from './mutations'

const tokenize = string => string.split(/([A-Z].+$)/)

export function sync(mutation) {
  let [method, resource] = tokenize(mutation)
  let url = '/' + resource.toLowerCase()
  let action = null
  let handler = null

  switch (method) {
    case 'add':
      action = record(mutation, resource)
      handler = append
      break
    case 'create':
      action = args => http({ url, data: args, method: 'post' })
      handler = append
      break
    case 'read':
      action = () => http({ url })
      handler = append
      break
    case 'remove':
      action = passThrough(mutation)
      handler = remove
      break
    case 'delete':
      action = args => http({ url: url + '/' + args.id, method: 'delete' })
      handler = remove
      break
    case 'update':
      action = passThrough(mutation)
      handler = update
      break
    case 'patch':
      action = data => http({ url: url + '/' + data.id, data, method: 'patch' })
      handler = update
      break
    default:
  }

  return { name: mutation, action, handler }
}
