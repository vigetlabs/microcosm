import React from 'react'
import { Link } from 'react-router-dom'

export default function NotFound({ resource = 'Page' }) {
  return (
    <div>
      Link
      <header className="header">
        <h1 className="text-display container">
          {resource} Not Found
        </h1>
      </header>

      <main role="main" className="container">
        <p className="spacious">
          It is possible this {resource.toLowerCase()} was removed or never
          existed.
        </p>
        <p className="spacious">
          <Link to="/">Try starting over from the beginning</Link>
        </p>
      </main>
    </div>
  )
}
