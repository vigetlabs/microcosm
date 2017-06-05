import Query from '../../../src/compare-tree/query'

describe('CompareTree > Query', function() {
  describe('#forEachPath', function() {
    it('enumerates through the given dependencies', function() {
      let query = new Query('1', 'foo.bar,bip.baz')
      let answer = {}

      query.forEachPath(path => {
        answer[path.join('.')] = true
      })

      expect(answer).toEqual({ 'foo.bar': true, 'bip.baz': true })
    })
  })
})
