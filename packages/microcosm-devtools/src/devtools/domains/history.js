import { updateHistory } from '../actions/history'

class History {
  getInitialState() {
    return {
      size: 0,
      head: null,
      root: null,
      tree: {},
      list: [],
      focused: null
    }
  }

  reset(old, newHistory) {
    let focused = old.focused === old.head ? newHistory.head : old.focused

    let list = []
    let cursor = newHistory.tree
    let parent = cursor

    while (cursor) {
      list.push(cursor)

      // cache current action
      parent = cursor

      // set the cursor to the action's next child
      cursor = parent.children.find(child => {
        return child.id === cursor.next
      })

      // if no next child was found but children exist, pick one
      if (!cursor && parent.children.length) {
        cursor = parent.children[0]
      }
    }

    return { ...newHistory, list, focused }
  }

  focus(old, focused) {
    return { ...old, focused }
  }

  register() {
    return {
      [updateHistory]: this.reset,
      ['detail']: this.focus
    }
  }
}

export default History
