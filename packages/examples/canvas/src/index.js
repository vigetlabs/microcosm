import { Microcosm, Effect, Domain, update, get, scheduler } from 'microcosm'
import prepareCanvas from './prepare-canvas'

let repo = new Microcosm()

let size = 20
let rows = Math.round(window.innerWidth / size)
let columns = Math.round(window.innerHeight / size)
let writes = 200

let advance = (x, y) => ({ x, y })

class Pixels extends Domain {
  getInitialState() {
    return {}
  }
  rotateHue(n) {
    return isNaN(n) ? 0 : n + 5
  }
  advance(state, { x, y }) {
    return update(state, [x, y], this.rotateHue)
  }
  register() {
    return {
      [advance]: this.advance
    }
  }
}

class Painter extends Effect {
  setup(repo, { context, canvas }) {
    this.canvas = canvas
    this.context = context

    prepareCanvas(canvas)
    context.scale(size, size)

    canvas.addEventListener('mousemove', event => {
      let x = (event.clientX / size) | 0
      let y = (event.clientY / size) | 0

      repo.push(advance, x, y)
    })
  }
  draw(repo, { x, y }) {
    let state = get(repo.state.pixels, [x, y], 0)

    this.context.fillStyle = `hsl(${state}, 70%, 60%)`
    this.context.fillRect(x, y, 1, 1)
  }
  register() {
    return {
      [advance]: this.draw
    }
  }
}

var canvas = document.createElement('canvas')
var context = canvas.getContext('2d')

repo.addDomain('pixels', Pixels)
repo.addEffect(Painter, { canvas, context })

document.body.appendChild(canvas)

function randomMoves(n) {
  while (n-- > 0) {
    let x = (Math.random() * rows) | 0
    let y = (Math.random() * columns) | 0

    repo.push(advance, x, y)
  }
}

let last = Date.now()
let average = 0
let trials = 0
let fps = 0

let label = document.getElementById('label')
function updateLabel() {
  label.innerHTML = [
    `${average.toFixed(2)}ms for ${writes} per batch`,
    `${fps} fps`,
    `${scheduler().size} queued`
  ].join(' | ')
}

function loop() {
  let now = Date.now()

  trials += 1
  average = (now - last) / trials
  fps = Math.round(1000 / average)

  if (fps > 59) {
    writes += 1
  } else if (fps < 57) {
    writes -= 1
  }

  randomMoves(writes)
  scheduler().push(loop)
}

setInterval(updateLabel, 1000)

loop()
