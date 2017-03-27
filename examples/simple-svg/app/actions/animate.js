function randomColor() {
  return '#' + Math.floor(Math.random() * 16777215).toString(16)
}

export function animate (time, duration) {
  let goal  = time + duration
  let color = randomColor()

  return function loop (task) {
    time += 16

    if (time > goal) {
      task.resolve({ color, time })
    } else {
      task.update({ color, time })
      requestAnimationFrame(() => loop(task))
    }
  }
}
