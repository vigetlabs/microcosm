import Viget     from './Viget'
import Microcosm from 'Microcosm'
import React     from 'react'

let app = new Microcosm()

function updateCircle() {
  let time = Date.now()

  return {
    cx : 150 + 50 * Math.sin(time / 200),
    cy : 150 + 35 * Math.cos(time / 200),
    r  : 12 + 8 * Math.cos(time / 200)
  }
}

app.addStore('circle', {
  getInitialState() {
    return { cx: 100, cy: 100, r: 10 }
  },

  register() {
    return {
      [updateCircle]: this.set
    }
  },

  set(old, next) {
    return next
  }
})

var body = document.body

requestAnimationFrame(function loop () {
  requestAnimationFrame(loop)
  app.push(updateCircle)
  React.render(<Viget circle={ app.get('circle')}/>, body)
})

app.start()
