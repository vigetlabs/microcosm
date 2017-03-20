import {
  getKeyPaths
} from '../../../src/compare-tree/key-path'

describe('getKeyPaths', function () {

  it('handles missing keys', function () {
    let answer = getKeyPaths()

    expect(answer).toEqual([])
  })

})
