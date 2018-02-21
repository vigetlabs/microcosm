/**
 * @flow
 */

import { type Microcosm } from '../src/microcosm'
import { type Subject } from './subject'
import { Registry } from './registry'
import { EMPTY_OBJECT } from './empty'

type EffectHandler = (repo: Microcosm, payload?: *, meta?: *) => void

export class Effect {
  repo: Microcosm
  options: Object
  _registry: Registry

  static defaults: ?Object

  static from(config: *): Class<Effect> {
    if (typeof config === 'function') {
      return config
    }

    function NewEntity(repo: Microcosm, options?: Object) {
      // $FlowFixMe
      Effect.prototype.constructor.call(this, repo, options)
    }

    NewEntity.prototype = Object.create(Effect.prototype)

    for (var key in config) {
      NewEntity.prototype[key] = config[key]
    }

    // $FlowFixMe
    return NewEntity
  }

  constructor(repo: Microcosm, options: Object) {
    this.repo = repo
    this.options = options
    this._registry = new Registry(this)

    this.setup(repo, options)

    let tracker = repo.history.subscribe(this._dispatch.bind(this))

    repo.subscribe({
      complete: () => {
        tracker.unsubscribe()
        this.teardown(repo, options)
      }
    })
  }

  /**
   * Setup runs right after an effect is added to a Microcosm. It
   * receives that repo and any options passed as the second argument.
   */
  setup(repo?: Microcosm, options?: Object): void {}

  /**
   * Runs whenever a Microcosm is torn down. This usually happens when
   * a Presenter component unmounts. Useful for cleaning up work done
   * in `setup()`.
   */
  teardown(repo?: Microcosm, options?: Object): void {}

  /**
   * Returns an object mapping actions to methods on the effect. This is the
   * communication point between a effect and the rest of the system.
   */
  register(): { [any]: (repo: Microcosm, payload?: *) => void } {
    return EMPTY_OBJECT
  }

  // Private -------------------------------------------------- //

  _resolve(action: Subject): EffectHandler[] {
    return this._registry.resolve(action)
  }

  _dispatch(action: Subject): void {
    var handlers = this._resolve(action)

    for (var i = 0, len = handlers.length; i < len; i++) {
      handlers[i].call(this, this.repo, action.payload)
    }
  }
}
