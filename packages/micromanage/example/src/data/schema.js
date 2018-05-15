/**
 * This is a JSON Hyper Schema definition. For a great overview of this spec, read:
 * https://blog.apisyouwonthate.com/getting-started-with-json-hyper-schema-184775b91f
 */

const JSON_PLACEHOLDER_API = 'https://jsonplaceholder.typicode.com'

export const POST = {
  title: 'Post',
  type: 'object',
  required: ['title'],
  properties: {
    id: { type: 'number' },
    body: { type: 'string' },
    title: { type: 'string' },
    userId: { type: 'number' }
  },
  base: JSON_PLACEHOLDER_API,
  links: [
    {
      rel: 'self',
      href: 'posts/{id}',
      templateRequired: ['id']
    },
    {
      rel: 'index',
      href: 'posts'
    }
  ]
}

export const COMMENT = {
  title: 'Comment',
  type: 'object',
  required: ['name', 'email', 'body'],
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    email: { type: 'string' },
    body: { type: 'string' },
    postId: { type: 'string' }
  },
  base: JSON_PLACEHOLDER_API,
  links: [
    {
      rel: 'self',
      href: 'comments/{id}',
      templateRequired: ['id']
    },
    {
      rel: 'index',
      href: 'posts/{post}/comments',
      templateRequired: ['post']
    }
  ]
}

export const ADDRESS = {
  title: 'Address',
  type: 'object',
  properties: {
    geo: {
      type: 'object',
      properties: {
        lat: { type: 'string' },
        lng: { type: 'string' }
      }
    },
    city: { type: 'string' },
    street: { type: 'string' },
    suite: { type: 'string' },
    zipcode: { type: 'string' }
  }
}

export const COMPANY = {
  title: 'Company',
  type: 'object',
  properties: {
    bs: { type: 'string' },
    catchPhrase: { type: 'string' },
    name: { type: 'string' }
  }
}

export const USER = {
  title: 'User',
  type: 'object',
  properties: {
    address: ADDRESS,
    company: COMPANY,
    email: { type: 'string' },
    id: { type: 'string' },
    name: { type: 'string' },
    phone: { type: 'string' },
    username: { type: 'string' },
    website: { type: 'string' }
  },
  base: JSON_PLACEHOLDER_API,
  links: [
    {
      rel: 'self',
      href: 'users/{id}',
      templateRequired: ['id']
    },
    {
      rel: 'index',
      href: 'users'
    }
  ]
}
