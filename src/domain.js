/**
 * Domains define the rules in which resolved actions are converted into
 * new state. They are added to a Microcosm instance using `addDomain`.
 * @constructor
 * @param {Microcosm} repo The instance of Microcosm that added this domain.
 * @param {Object} [options] Options passed from `addDomain`
 */
export default function Domain (options, repo) {
  this.options = options
  this.repo = repo
}

const NO_REGISTRATIONS = {}

Domain.prototype = {

  /**
   * Generate the starting value for the particular state this domain is
   * managing. This will be called by the Microcosm using this domain when
   * it is started.
   */
  getInitialState () {
    return undefined
  },

  /**
   * Setup runs right after a domain is added to a Microcosm, but before it
   * runs getInitialState. This is useful for one-time setup instructions.
   * @param {Microcosm} repo The instance of Microcosm that added this domain.
   * @param {Object} [options] Options passed from `addDomain`
   */
  setup (repo, options) {
    // Do nothing
  },

  /**
   * Runs whenever `Microcosm::teardown` is invoked. Useful for cleaning up
   * work done in `setup()`.
   * @param {Microcosm} repo The instance of Microcosm that added this domain.
   */
  teardown (repo) {
    // Do nothing
  },

  /**
   * Returns an object mapping actions to methods on the domain. This is the
   * communication point between a domain and the rest of the system.
   */
  register () {
    return NO_REGISTRATIONS
  },

  /**
   * Allows a domain to transform data before it leaves the system. It gives
   * the domain the opportunity to reduce non-primitive values into JSON. By
   * default, this returns nothing. This is a safe default to prevent
   * unexpected data from serializing.
   * @param {Object} state State for this domain
   */
   serialize (state) {
     return undefined
   },

   /**
    * Allows data to be transformed into a valid shape before it enters a
    * Microcosm. This is the reverse of `serialize`.
    * @param {Object} raw Raw data coming in from `Microcosm::deserialize`
    */
   deserialize (raw) {
     return raw
   }

}
