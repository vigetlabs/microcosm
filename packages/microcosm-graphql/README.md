# Microcosm GraphQL

This is a draft of Microcosm bindings for GraphQL

## Setup

```
yarn install
yarn watch

# In a separate tab
yarn server
```

## What is it

I want to GraphQL schemas into Microcosms:

```graphql
type Author {
  id: ID
  name: String
}

type Post {
  id: ID
  title: String
  author: ID
  created: String
  updated: String
}

type Comment {
  id: ID
  author: Author
  content: String
  created: String
}

type UI {
  menuOpen: Boolean
}

type Repo {
  authors: [Author]
  comments: [Comment]
  posts: [Post]
  ui: UI
}

type Query {
  author(id: ID): Author
  authors(id: ID, name: String): [Author]
  comment(id: ID): Comment
  comments(id: ID): [Comment]
  post(id: ID): Post
  posts(id: ID): [Post]
}
```
