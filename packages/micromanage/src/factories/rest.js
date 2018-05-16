import axios from 'axios'
import assert from 'assert'

function parameterize(path, params) {
  return path.replace(/\{(.+?)\}/g, (_, match) => {
    assert(match in params, `Expected parameter ${match} in params.`)
    return params[match]
  })
}

export class RestFactory {
  constructor(Entity) {
    this.schema = Entity.schema
    this.request = axios.create({
      baseURL: this.schema.base
    })

    let links = this.schema.links || []

    links.forEach(link => {
      switch (link.rel) {
        case 'self':
          this.showUrl = link
          break
        case 'index':
          this.indexUrl = link
          break
        default:
        // Do nothing
      }
    })
  }

  parse(response) {
    return {
      data: response.data,
      headers: response.headers,
      params: response.config.params || {}
    }
  }

  index(query) {
    let url = parameterize(this.indexUrl.href, query)

    return this.request.get(url, { params: query }).then(this.parse.bind(this))
  }

  show(params) {
    let url = parameterize(this.showUrl.href, params)

    return this.request.get(url).then(this.parse.bind(this))
  }

  create(params) {
    let url = parameterize(this.showUrl.href, params)

    return this.request.post(url, params).then(this.parse.bind(this))
  }

  update(params) {
    let url = parameterize(this.showUrl.href, params)

    return this.request.patch(url, params).then(this.parse.bind(this))
  }

  destroy(id) {
    let url = parameterize(this.showUrl.href, { id })

    return this.request.delete(url).then(response => {
      return { data: id, headers: response.headers }
    })
  }
}
