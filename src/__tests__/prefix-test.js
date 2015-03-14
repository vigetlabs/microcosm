import prefix from '../prefix'
import {identify} from '../prefix'

describe('prefix', function() {

  it ('can prefix a single item', function() {
    identify('foo', 'bar').should.equal('foo-bar')
  })

  it ('can prefix the methods of a class', function() {
    let Foo = {
      bar() {}
    }

    prefix(Foo, 'pref').should.have.property('bar', 'pref-bar')
  })

})
