import {
  backfill
} from '../../../src/utils'

describe('Utils.backfill', function () {

  it('adds missing keys to an object', function () {
    let styles = backfill({}, { color: 'blue' })

    expect(styles.color).toEqual('blue')
  })

  it('does not add keys already in an object', function () {
    let styles = backfill({ color: 'red' }, { color: 'blue' })

    expect(styles.color).toEqual('red')
  })

  it('returns a new object if a key is added', function () {
    let original = {}
    let styles = backfill(original, { color: 'blue', font: 'helvetica' })

    expect(styles).not.toBe(original)
  })

  it('does not return a new object if nothing changes', function () {
    let original = { color: 'red' }
    let styles = backfill(original, { color: 'blue' })

    expect(styles).toBe(original)
  })

  it('returns the filling object if the subject is null', function () {
    let filler = { color: 'blue' }
    let styles = backfill(null, filler)

    expect(styles).toBe(filler)
  })

  it('handles if the filling object is null', function () {
    let original = { color: 'blue' }
    let styles = backfill(original, null)

    expect(styles).toBe(original)
  })

})
