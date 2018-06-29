import asciitree from 'asciitree'

export function asTree(history) {
  function dig(focus) {
    let children = focus.children.map(dig)

    return children.length ? [focus.key, ...children] : focus.key
  }

  return asciitree(dig(history.toJSON().tree))
}

export const delay = n => new Promise(resolve => setTimeout(resolve, n))

export const withUniqueScheduler = () => {
  let oldScheduler = global.__MICROCOSM_SCHEDULER__

  beforeEach(function() {
    global.__MICROCOSM_SCHEDULER__ = null
  })

  afterEach(function() {
    global.__MICROCOSM_SCHEDULER__ = oldScheduler
  })
}
