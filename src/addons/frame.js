// Cross platform request animation frame

const hasFrame = typeof requestAnimationFrame !== 'undefined'

let requestFrame = setTimeout
let cancelFrame = clearTimeout

/* istanbul ignore if */
if (hasFrame) {
  requestFrame = requestAnimationFrame
  cancelFrame = cancelAnimationFrame
}

export { requestFrame, cancelFrame }
