import Microscope from '../Microscope'
import React      from 'react/addons'

describe('Microscope', function() {
  const flux =  {
    listen() {},
    ignore() {},
    stores: { user: { name: 'fizz' } }
  }

  it ('passes properties', function() {
    let Child = React.createClass({
      statics: {
        query({ user }) {
          return { user }
        }
      },
      render() {
        return <p>{ this.props.user.name }</p>
      }
    })

    let Component = React.createClass({
      render() {
        return <Microscope flux={ flux }><Child /></Microscope>
      }
    })

    let component = React.addons.TestUtils.renderIntoDocument(<Component />)

    component.getDOMNode().textContent.should.equal('fizz')
  })

})
