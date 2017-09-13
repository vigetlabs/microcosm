/**
 * Taken from pixelpaint
 * https://github.com/dtinth/pixelpaint
 */

import Microcosm from 'microcosm'
import { h, render } from 'preact'
import { Presenter, withSend } from 'microcosm-preact'

const repo = new Microcosm({ batch: true })
const toggle = (a, j) => a + ',' + j

repo.addDomain('pixels', {
  getInitialState() {
    return {}
  },
  toggle(state, key) {
    return { ...state, [key]: !state[key] }
  },
  register() {
    return {
      [toggle]: this.toggle
    }
  }
})

const Pixel = withSend(function Pixel({ i, j, active, send }) {
  let style = { top: i * 3, left: j * 3 }
  let onToggle = () => send(toggle, i, j)

  return (
    <div
      className="pixel"
      style={style}
      onMouseOver={onToggle}
      data-active={active ? '1' : '0'}
    />
  )
})

let size = 64
function Canvas() {
  const items = []

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      items.push(<PixelContainer repo={repo} i={i} j={j} key={i + ',' + j} />)
    }
  }

  return <div>{items}</div>
}

class PixelContainer extends Presenter {
  getModel({ i, j }) {
    let key = i + ',' + j

    return {
      active: state => state.pixels[key]
    }
  }

  render({ i, j }, state, { active }) {
    return <Pixel i={i} j={j} onToggle={this.toggle} active={active} />
  }
}

render(<Canvas />, document.getElementById('app'))
