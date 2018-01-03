import asciitree from 'asciitree'

export function asTree(history) {
  function dig(focus) {
    let children = history.children(focus).map(dig)

    return children.length ? [focus.tag, ...children] : focus.tag
  }

  console.log(asciitree(dig(history.root)))
}
