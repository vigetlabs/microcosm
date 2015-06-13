function update () {
  let time = Date.now() / 200
  let sin  = Math.sin(time)
  let cos  = Math.cos(time)

  return {
    cx : 150 + 50 * sin,
    cy : 150 + 35 * cos,
    r  : 12 + 8 * cos
  }
}

export { update }
