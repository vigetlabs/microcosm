import React from 'react'
import { BrowserRouter, Route, Link } from 'react-router-dom'
import { RepoContext } from 'microcosm-dom'
import { PostsIndex } from './posts/index'
import { PostsShow } from './posts/show'
import { UsersIndex } from './users/index'
import { UsersShow } from './users/show'

export function Application({ repo, Router = BrowserRouter }) {
  return (
    <RepoContext.Provider value={repo}>
      <Router>
        <div>
          <nav className="nav">
            <Link to="/">Home</Link>
            <Link to="/users">Users</Link>
          </nav>
          <main>
            <Route exact path="/" component={PostsIndex} />
            <Route path="/posts/:id" component={PostsShow} />
            <Route exact path="/users" component={UsersIndex} />
            <Route path="/users/:id" component={UsersShow} />
          </main>
        </div>
      </Router>
    </RepoContext.Provider>
  )
}
