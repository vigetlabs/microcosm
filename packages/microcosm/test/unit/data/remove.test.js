import { remove } from 'microcosm'

describe('Utils.remove', function() {
  const subject = {
    styles: {
      color: 'blue',
      font: 'Helvetica, sans-serif'
    }
  }

  it('removes an existing key', function() {
    let next = remove(subject, 'styles.color')

    expect(next).not.toHaveProperty('styles.color')
    expect(next).not.toBe(subject)
    expect(next.styles).not.toBe(subject.styles)
  })

  it('copies the object on removal', function() {
    let next = remove(subject, 'styles.color')

    expect(next).not.toBe(subject)
    expect(next.styles).not.toBe(subject.styles)
  })

  it('does not copy if removing a non-existant key', function() {
    let next = remove(subject, 'something-else')

    expect(next).toBe(subject)
  })
})
