function randomColor() {
  return '#' + Math.floor(Math.random() * 16777215).toString(16);
}

function animate (time, duration) {
  let goal  = time + duration
  let color = randomColor()

  return function (action) {
    requestAnimationFrame(function loop () {
      time += 16

      if (time > goal) {
        action.close({ color, time })
      } else {
        action.send({ color, time })
        requestAnimationFrame(loop)
      }
    })
  }
}

export { animate }
