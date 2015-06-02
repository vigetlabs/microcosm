import Microcosm from '../Microcosm'

describe('Optimistic updates', function() {
  let app;

  let updatePerson = function* (fail) {
    yield { name : 'Nate' }
    yield new Promise(function(resolve, reject) {
      if (fail) {
        setTimeout(_ => reject(), 100)
      } else {
        setTimeout(function() {
          resolve({ name: 'Nate', eyes: 'blue' })
        }, 100)
      }
    })
  }

  let updateDog = function* () {
    yield { name : 'Felix' }
  }

  let people = {
    register() {
      return {
        [updatePerson] : (a, b) => ({ ...a, ...b })
      }
    }
  }

  let dogs = {
    register() {
      return {
        [updateDog] : (a, b) => ({ ...a, ...b })
      }
    }
  }

  beforeEach(function(done) {
    app = new Microcosm()
    app.addStore('people', people)
    app.addStore('dogs', dogs)
    app.start(done)
  })

  it ('properly rolls back failed updates', function(done) {
    app.push(updatePerson, 'fail')
    app.get([ 'people', 'name' ]).should.equal('Nate')

    setTimeout(function() {
      expect(app.get([ 'people', 'name' ])).to.equal(undefined)
      done()
    }, 200)
  })

  it ('respects operations from other actions', function(done) {
    app.push(updatePerson, 'fail')
    app.get([ 'people', 'name' ]).should.equal('Nate')

    app.push(updateDog)
    app.get([ 'dogs', 'name' ]).should.equal('Felix')

    setTimeout(function() {
      expect(app.get([ 'people', 'name' ])).to.equal(undefined)
      expect(app.get([ 'dogs', 'name' ])).to.equal('Felix')
      done()
    }, 200)
  })
})
