import React from 'react'
import { Microcosm } from 'microcosm'
import { ActionForm, Presenter } from 'microcosm-dom/react'
import { mount, unmount, submit } from './helpers'

describe('ActionForm', function() {
  describe('callbacks', function() {
    it('executes onComplete when that action completes', function() {
      let repo = new Microcosm()
      let reply = action => repo.push(action, true)
      let onComplete = jest.fn()

      let form = mount(
        <ActionForm action="test" onComplete={onComplete} send={reply} />
      )

      submit(form)

      expect(onComplete).toHaveBeenCalledWith(true, repo.history.head.meta)
    })

    it('executes onError when that action fails', function() {
      let repo = new Microcosm()
      let reply = () => repo.push(() => action => action.error('bad'))
      let onError = jest.fn()
      let form = mount(<ActionForm onError={onError} send={reply} />)

      submit(form)

      expect(onError).toHaveBeenCalledWith('bad', repo.history.head.meta)
    })

    it('executes onStart when that action opens', function() {
      let repo = new Microcosm()
      let reply = () => repo.push(() => action => action.next('open'))
      let onStart = jest.fn()

      let form = mount(
        <ActionForm action="test" onStart={onStart} send={reply} />
      )

      submit(form)

      expect(onStart).toHaveBeenCalledWith('open', repo.history.head.meta)
    })

    it('executes onUpdate when that action sends an update', function() {
      let repo = new Microcosm()
      let action = repo.push(() => action => {})
      let reply = () => action
      let onNext = jest.fn()

      let form = mount(
        <ActionForm action="test" onNext={onNext} send={reply} />
      )

      submit(form)

      action.next('loading')

      expect(onNext).toHaveBeenCalledWith('loading', repo.history.head.meta)
    })

    it('does not execute callbacks if not given an action', function() {
      let onComplete = jest.fn()

      let form = mount(<ActionForm onComplete={onComplete} send={() => null} />)

      submit(form)

      expect(onComplete).not.toHaveBeenCalled()
    })

    it('removes action callbacks when the component unmounts', function() {
      let repo = new Microcosm()
      let action = repo.push(() => action => {})
      let send = jest.fn(() => action)
      let onComplete = jest.fn()

      let form = mount(<ActionForm onComplete={onComplete} send={send} />)

      submit(form)

      expect(send).toHaveBeenCalled()

      unmount(form)

      action.complete()

      expect(action.meta.status).toBe('complete')
      expect(onComplete).not.toHaveBeenCalled()
    })
  })

  describe('context', function() {
    it('inherits send from context', function() {
      let repo = new Microcosm()
      let onComplete = jest.fn()

      submit(
        mount(
          <Presenter repo={repo}>
            <ActionForm action="test" onComplete={onComplete} />
          </Presenter>
        )
      )

      expect(onComplete).toHaveBeenCalledWith({}, repo.history.head.meta)
    })

    it('send as a prop overrides context', function() {
      let repo = new Microcosm()
      let reply = action => repo.push(action, 'from-prop')
      let onComplete = jest.fn()

      submit(
        mount(
          <Presenter>
            <ActionForm action="test" onComplete={onComplete} send={reply} />
          </Presenter>
        )
      )

      expect(onComplete).toHaveBeenCalledWith(
        'from-prop',
        repo.history.head.meta
      )
    })
  })

  describe('manual operation', function() {
    it('can pass in send manually', function() {
      let send = jest.fn()
      let form = mount(<ActionForm action="test" send={send} />)

      submit(form)

      expect(send).toHaveBeenCalled()
    })

    it('can call click directly', function() {
      let send = jest.fn()

      class Test extends React.Component {
        componentDidMount() {
          this.el.submit()
        }
        render() {
          return (
            <ActionForm action={test} send={send} ref={el => (this.el = el)} />
          )
        }
      }

      mount(<Test />)

      expect(send).toHaveBeenCalled()
    })
  })

  describe('value prop', function() {
    it('sends a value prop when provided', function() {
      let send = jest.fn()
      let form = mount(<ActionForm action="test" send={send} value={true} />)

      submit(form)

      expect(send).toHaveBeenCalledWith('test', true)
    })

    it('sends null when the value prop is null', function() {
      let send = jest.fn()
      let form = mount(<ActionForm action="test" send={send} value={null} />)

      submit(form)

      expect(send).toHaveBeenCalledWith('test', null)
    })

    it('calls prepare on the value', function() {
      let send = jest.fn()
      let prepare = jest.fn(value => value.toUpperCase())
      let form = mount(
        <ActionForm
          action="action"
          send={send}
          prepare={prepare}
          value="test"
        />
      )

      submit(form)

      expect(prepare).toHaveBeenCalledWith('test')
      expect(send).toHaveBeenCalledWith('action', 'TEST')
    })
  })
})
