/**
 * EventEmitter
 *
 * This is a private event emitter based upon the component/emitter
 * implementation. It enforces a few constraints to ensure users of
 * Microcosm have a good time:
 *
 * - `emit` is private
 * - subscriptions can be prioritized (to improve rendering efficiency)
 *
 * component/emitter:
 * https://github.com/component/emitter
 *
 * @private
 */

export default class Emitter {

  /**
   * Listen on the given `event` with `fn`.
   *
   * @param {String} event
   * @param {Function} fn
   * @return {Emitter}
   */
  on (event, fn, scope) {
    this._listeners = this._listeners || {}

    const callback = this._listeners['$' + event] = this._listeners['$' + event] || []

    /**
     * Reversing priority helps addons like 'Connect' and 'Presenter'
     * work more efficiently. It allows changes to occur "top down"
     * instead of "bottom up". This is because event subscription occurs
     * within React lifecycle methods, which prioritize children before
     * parents.
     */
    callback[callback.length] = [fn, scope || this]

    return this
  }

  /**
   * Adds an `event` listener that will be invoked a single time then
   * automatically removed.
   *
   * @param {String} event
   * @param {Function} fn
   * @return {Emitter}
   */
  once (event, fn, scope) {
    function listener () {
      this.off(event, listener)
      fn.apply(this, arguments)
    }

    listener.fn = fn

    this.on(event, listener, scope)

    return this
  }

  /**
   * Remove the given callback for `event` or all
   * registered callbacks.
   *
   * @param {String} event
   * @param {Function} fn
   * @return {Emitter}
   */
  off (event, fn, scope) {
    // Remove all listeners
    if (0 == arguments.length) {
      delete this._listeners
    }

    if (!this._listeners || this._listeners.hasOwnProperty('$' + event) === false) {
      return this
    }

    // specific event
    let callbacks = this._listeners['$' + event]

    // remove all handlers
    if (1 == arguments.length) {
      delete this._listeners['$' + event]
      return this
    }

    // Remove the specific handler, splice so that listeners removed
    // during another event broadcast are not invoked
    var cb;
    for (var i = 0; i < callbacks.length; i++) {
      cb = callbacks[i];
      if ((cb[0] === fn || cb[0].fn === fn) && cb[1] === (scope || this)) {
        callbacks.splice(i, 1);
        break;
      }
    }

    return this
  }

  /**
   * Emit `event` with the given args.
   *
   *
   * @param {String} event
   * @param {Mixed} ...
   * @return {Emitter}
   * @private
   */
  _emit (event, ...params) {
    if (!this._listeners) {
      return this
    }

    let callbacks = this._listeners['$' + event]

    if (callbacks) {
      for (var i = 0; i < callbacks.length; i++) {
        callbacks[i][0].apply(callbacks[i][1], params)
      }
    }

    return this
  }

  listenTo (emitter, event, fn) {
    this._listening = this.listening || []

    emitter.on(event, fn, this)

    this._listening.push({ source: emitter, event, fn, scope: this })

    return this
  }

  stopListening (emitter) {
    if (!this._listening) {
      return this
    }

    for (var i = 0; i < this._listening.length; i++) {
      var { source, event, fn, scope } = this._listening[i]

      if (source === emitter || emitter == null) {
        source.off(event, fn, scope)
        this._listening.splice(i, 1)
      }
    }

    return this
  }

}
