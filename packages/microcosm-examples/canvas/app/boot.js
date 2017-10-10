import Microcosm, { update } from 'microcosm'
import CompareTree from 'microcosm/addons/compare-tree'
import prepareCanvas from './prepare-canvas'

let repo = new Microcosm({ batch: true })
let tree = new CompareTree()

repo.on('change', tree.update, tree)

let size = 20
let limit = Infinity
let rows = Math.min((window.innerWidth / size) | 0, limit)
let columns = Math.min((window.innerHeight / size) | 0, limit)
let writes = size * 50

let advance = (x, y) => ({ x, y })

repo.addDomain('pixels', {
  getInitialState() {
    return {}
  },
  rotateHue(n) {
    return isNaN(n) ? 0 : n + 5
  },
  advance(state, { x, y }) {
    return update(state, [x, y], this.rotateHue)
  },
  register() {
    return {
      [advance]: this.advance
    }
  }
})

var canvas = document.createElement('canvas')
var context = canvas.getContext('2d')

document.body.appendChild(canvas)

prepareCanvas(canvas)

context.scale(size, size)

for (let x = 0; x < rows; x++) {
  for (let y = 0; y < columns; y++) {
    tree.on(`pixels.${x}.${y}`, hue => {
      context.fillStyle = `hsl(${hue}, 70%, 60%)`
      context.fillRect(x, y, 1, 1)
    })
  }
}

canvas.addEventListener('mousemove', event => {
  let x = (event.clientX / size) | 0
  let y = (event.clientY / size) | 0

  repo.push(advance, x, y)
})

function randomMoves(n = 1) {
  while (n-- > 0) {
    let x = (Math.random() * rows) | 0
    let y = (Math.random() * columns) | 0

    repo.push(advance, x, y)
  }
}

let label = document.getElementById('label')
function updateLabel() {
  let events = rows * columns * writes

  label.innerHTML =
    `${rows}x${columns} (${size}px grid)` +
    `| ${writes} writes/frame` +
    `| ${events.toLocaleString()} keys watched/frame`
}

const SLOW = 1000 / 58
const FAST = 1000 / 60

function play() {
  let last = performance.now()
  requestAnimationFrame(function loop() {
    let next = performance.now()
    let elapsed = next - last

    if (elapsed > SLOW) {
      writes--
    } else if (elapsed < FAST) {
      writes++
    }

    last = next

    randomMoves(writes)
    requestAnimationFrame(loop)
  })
}

play()
updateLabel()
setInterval(updateLabel, 1500)
