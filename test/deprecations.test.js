import Microcosm from '../src/microcosm'
import logger from './helpers/logger'
import Action from '../src/action'

describe('Microcosm::replace - Replaced by Microcosm::patch', function () {

  test('deserializes data', function () {
    const repo = new Microcosm()

    repo.addDomain('dummy', {
      deserialize: state => state.toUpperCase()
    })

    // Mute warning
    logger.record()
    repo.replace({ dummy: 'different' })
    logger.restore()

    expect(repo.state.dummy).toEqual('DIFFERENT')
  })

  test('raises a console warning', function () {
    const repo = new Microcosm()

    // Mute warning
    logger.record()
    repo.replace({ dummy: 'different' })
    expect(logger.count('warn')).toEqual(1)
    logger.restore()
  })

})

describe('Microcosm:addStore - Replaced by Microcosm::addDomain', function () {

  test('warns when using addStore', function () {
    const repo = new Microcosm()

    logger.record()
    repo.addStore('test', {})
    expect(logger.count('warn')).toEqual(1)
    logger.restore()
  })

})

describe('Action::close - Replaced by Action::resolve', function () {

  test('warns when using close', function () {
    const action = new Action(n => n)

    logger.record()

    action.close()

    expect(logger.count('warn')).toBe(1)

    logger.restore()
  })

})
