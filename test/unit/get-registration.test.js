import tag from '../../src/tag'
import getRegistration, {STATUSES} from '../../src/get-registration'

const action = tag(n => n)

describe('getRegistration', function () {

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
    for (let status in STATUSES) {
      let alias = STATUSES[status]

      it(`can inspect the ${status} status`, function () {
        let success = n => n
        let answer = getRegistration({
          [action]: {
            [status]: success
          }
        }, action, STATUSES[status])

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
