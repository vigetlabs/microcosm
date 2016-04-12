const update = function(n) {
  return n
}

function animate (push, done) {
  let color = '#' + Math.floor(Math.random() * 16777215).toString(16);
  let frame = null

  return (start, duration=3000) => {
    let goal = start + duration

    cancelAnimationFrame(frame)

    frame = requestAnimationFrame(function loop() {
      if (start > goal) {
        done(null, goal)
      } else {
        push(update, { color, time: start += 16 })
        requestAnimationFrame(loop)
      }
    })
  }
}

export { update, animate }
