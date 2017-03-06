import {
  inherit
} from '../../../src/utils'

describe('Utils.inherit', function () {

  it('does not assign properties it does not own', function () {
    const a = inherit(function Child () {}, function Parent () {})

    expect(a.constructor).toEqual(a.constructor)
  })

})
