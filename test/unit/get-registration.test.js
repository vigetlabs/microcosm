import tag from '../../src/tag'
import getRegistration, { ALIASES } from '../../src/get-registration'

const action = tag(n => n)

describe('getRegistration', function () {
  it('can use nested objects to return specific statuses', function () {
    let success = n => n
    let answer = getRegistration(
      {
        [action]: {
          reject: success
        }
      },
      action,
      'reject'
    )

    expect(answer).toBe(success)
  })

  it('throws if given an invalid status', function () {
    let fail = function () {
      getRegistration({}, action, 'totally-missing')
    }

    expect(fail).toThrow('Invalid action status totally-missing')
  })

  describe('Action aliasing', function () {
    for (let status in ALIASES) {
      let alias = ALIASES[status]

      it(`can inspect the ${status} status`, function () {
        let success = n => n
        let answer = getRegistration(
          {
            [action]: {
              [status]: success
            }
          },
          action,
          ALIASES[status]
        )

        expect(answer).toBe(success)
      })

      it(`can register the ${alias} alias`, function () {
        let success = n => n
        let answer = getRegistration(
          {
            [action]: {
              [alias]: success
            }
          },
          action,
          status
        )

        expect(answer).toBe(success)
      })
    }
  })

  describe('Errors', function () {
    describe('Flat registrations', function () {
      it('throws when a registration is undefined', function () {
        expect(function () {
          getRegistration(
            {
              [action]: undefined
            },
            action,
            'resolve'
          )
        }).toThrow(
          'action key within a registration is undefined. Is it being referenced correctly?'
        )
      })

      it('uses the command name when it can', function () {
        let getUser = tag(function getUser () {})

        expect(function () {
          getRegistration(
            {
              [getUser]: undefined
            },
            getUser,
            'resolve'
          )
        }).toThrow(
          'getUser key within a registration is undefined. Is it being referenced correctly?'
        )
      })
    })

    describe('Nested registrations', function () {
      it('throws when a nested status registration is undefined', function () {
        expect(function () {
          getRegistration(
            {
              [action]: {
                reject: undefined
              }
            },
            action,
            'reject'
          )
        }).toThrow(
          'The "reject" key within a nested registration for an action is undefined. Is it being referenced correctly?'
        )
      })

      it('throws when a nested alias registration is undefined', function () {
        expect(function () {
          getRegistration(
            {
              [action]: {
                error: undefined
              }
            },
            action,
            'reject'
          )
        }).toThrow(
          'The "error" key within a nested registration for an action is undefined. Is it being referenced correctly?'
        )
      })

      it('uses the action name when it can', function () {
        let getUser = tag(function getUser () {})

        expect(function () {
          getRegistration(
            {
              [getUser]: {
                error: undefined
              }
            },
            getUser,
            'reject'
          )
        }).toThrow(
          'The "error" key within a nested registration for getUser is undefined. Is it being referenced correctly?'
        )
      })
    })
  })
})
