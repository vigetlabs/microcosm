import React from 'react'

export default function Announcer({ user, message }) {
  return (
    <div className="audible" aria-live="polite">
      {user} said: {message}
    </div>
  )
}
