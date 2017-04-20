export default function prepareCanvas(canvas) {
  var context = canvas.getContext('2d')

  // https://www.html5rocks.com/en/tutorials/canvas/hidpi/
  let pixelRatio = window.devicePixelRatio || 1
  let backingStore = context.backingStorePixelRatio || 1
  let density = pixelRatio / backingStore

  let width = window.innerWidth
  let height = window.innerHeight

  canvas.width = width * density
  canvas.height = height * density

  canvas.style.height = height + 'px'
  canvas.style.width = width + 'px'

  context.scale(density, density)

  context.fillStyle = '#eee'
  context.fillRect(0, 0, width, height)
  context.font = '16px Helvetica'
}
