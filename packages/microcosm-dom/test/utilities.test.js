import { shallowDiffers } from '../src/utilities'

describe('shallowDiffers', function() {
  it('returns true when a property is added', () => {
    expect(shallowDiffers({ foo: 'bar' }, { foo: 'bar', bip: 'baz' }))
  })
})
