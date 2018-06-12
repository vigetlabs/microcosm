import React from 'react'
import DOM from 'react-dom'
import Microcosm from 'microcosm'
import Presenter from 'microcosm/addons/presenter'
import ActionButton from 'microcosm/addons/action-button'

const increase = 'increase'
const decrease = 'decrease'

function eventuallyIncrease(fail) {
  let payload = fail ? new Error('sorry') : 1

  return action => {
    action.open()

    setTimeout(() => {
      fail ? action.reject(payload) : action.resolve(payload)
    }, 700 + Math.random() * 700)
  }
}

class Repo extends Microcosm {
  setup() {
    this.addDomain('count', {
      getInitialState() {
        return 0
      },

      add(count, n) {
        return count + n
      },

      subtract(count, n) {
        return count - n
      },

      register() {
        return {
          [increase]: this.add,
          [eventuallyIncrease]: this.add,
          [decrease]: this.subtract
        }
      }
    })
  }

  seed() {
    this.push(increase, 1)
    this.push(increase, 1)
    this.push(increase, 1)
    this.push(increase, 1)
  }
}

class App extends Presenter {
  getModel() {
    return {
      count: state => state.count
    }
  }

  render() {
    return (
      <main>
        <h1>This is a test</h1>
        <p>This test lives in an iframe. If you are testing the chrome extension, view the <a href="/target.html">target page</a></p>
        <p>Count: {this.model.count}</p>
        <footer>
          <ActionButton action={decrease} value={1}>
            Down
          </ActionButton>
          <ActionButton action={increase} value={1}>
            Up
          </ActionButton>

          <button onClick={() => this.send(eventuallyIncrease)}>
            Eventually Add
          </button>

          <button onClick={() => this.send(eventuallyIncrease, true)}>
            Eventually Fail
          </button>
        </footer>
      </main>
    )
  }
}

export default function render(el) {
  let repo = new Repo({ debug: true })

  DOM.render(<App repo={repo} />, document.querySelector(el))

  return repo
}
