import { update } from '../../../src/utils'

describe('Utils.update', function () {
  const subject = {
    styles: {
      color: 'blue',
      font: 'Helvetica, sans-serif'
    }
  }

  it('updates a value in-place', function () {
    let next = update(subject, 'styles.color', color => color.toUpperCase())

    expect(next.styles.color).toEqual('BLUE')
  })

  it('can work from a fallback if a key is missing', function () {
    let next = update(subject, 'styles.padding', padding => padding += 10, 0)

    expect(next.styles.padding).toEqual(10)
  })

  it('can set a non-function value, proxying set', function () {
    let next = update(subject, 'styles.padding', 10)

    expect(next.styles.padding).toEqual(10)
  })
})
