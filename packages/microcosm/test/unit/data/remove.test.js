import { remove } from 'microcosm'

describe('Utils.remove', function() {
  describe('removing keys from objects', function() {
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

  describe('removing keys from arrays', function() {
    it('removes an element of an array', function() {
      let list = ['a', 'b', 'c']
      let next = remove(list, 1)

      expect(next).toEqual(['a', 'c'])
    })

    it('removes an element of an array within an object ', function() {
      let data = { letters: ['a', 'b', 'c'] }
      let next = remove(data, 'letters.1')

      expect(next).toEqual({ letters: ['a', 'c'] })
    })
  })
})
