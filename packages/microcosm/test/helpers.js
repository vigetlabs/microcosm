import asciitree from 'asciitree'

export function asTree(history) {
  function dig(focus) {
    let children = focus.children.map(dig)

    return children.length ? [focus.key, ...children] : focus.key
  }

  return asciitree(dig(history.toJSON().tree))
}
