import React from 'react'
import { BrowserRouter, Route } from 'react-router-dom'
import { RepoContext } from './connection'
import { PostsIndex } from './posts/index'
import { PostsShow } from './posts/show'

export function Application({ repo, Router = BrowserRouter }) {
  return (
    <RepoContext.Provider value={repo}>
      <Router>
        <main>
          <Route exact path="/" component={PostsIndex} />
          <Route path="/posts/:id" component={PostsShow} />
        </main>
      </Router>
    </RepoContext.Provider>
  )
}
