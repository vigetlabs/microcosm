import tag from '../../src/tag'
import getRegistration from '../../src/get-registration'

import {
  ACTION_ALIASES
} from '../../src/constants'

const action = tag(n => n)

describe('getRegistration', function () {

  it('returns null when no registrations method exists', function () {
    let answer = getRegistration({})

    expect(answer).toEqual(null)
  })

  it('returns a registration for done when there is no status', function () {
    let success = n => n
    let answer = getRegistration({
      [action]: success
    }, action)

    expect(answer).toBe(success)
  })

  it('returns the done registration for a nested object when there is no status', function () {
    let success = n => n
    let answer = getRegistration({
      [action]: {
        done: success
      }
    }, action)

    expect(answer).toBe(success)
  })

  it('can use nested objects to return specific statuses', function () {
    let success = n => n
    let answer = getRegistration({
      [action]: {
        reject: success
      }
    }, action, 'reject')

    expect(answer).toBe(success)
  })

  it('throws if given an invalid status', function () {
    let fail = function () {
      getRegistration({}, action ,'totally-missing')
    }

    expect(fail).toThrow('Invalid action status totally-missing')
  })

  describe('Action aliasing', function () {
    for (let status in ACTION_ALIASES) {
      let alias = ACTION_ALIASES[status]

      it(`can inspect the ${status} status`, function () {
        let success = n => n
        let answer = getRegistration({
          [action]: {
            [status]: success
          }
        }, action, ACTION_ALIASES[status])

        expect(answer).toBe(success)
      })

      it(`can register the ${alias} alias`, function () {
        let success = n => n
        let answer = getRegistration({
          [action]: {
            [alias]: success
          }
        }, action, status)

        expect(answer).toBe(success)
      })
    }
  })
})
