import Presenter from './presenter'

/**
 * Sets up the required context for a React component tree
 * so that an instance of Microcosm can be made available.
 *
 * @example
 * const repo = new Microcosm()
 *
 * // <ChildComponent /> will receive `repo` within its context.
 * ReactDOM.mount((
 *   <Provider repo={ repo }>
 *      <ChildComponent />
 *   </Provider>
 * ), document.getElementById('repo'))
 */
export default class Provider extends Presenter {

}
