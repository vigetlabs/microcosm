# Quickstart

This guide will teach you how to build a simple app using
[Microcosm](https://github.com/vigetlabs/microcosm) and
[React](https://github.com/facebook/react).

## What we'll cover

1. Project setup
2. Routing
3. Presenters
4. Domains
5. Actions

## Project setup

Let's clone the [`microcosm-quickstart`](https://github.com/vigetlabs/microcosm-quickstart) repo and install
dependencies. Type these commands into your terminal:

```bash
git clone https://github.com/vigetlabs/microcosm-quickstart
cd microcosm-quickstart
npm install
```

Don't have npm? [Learn how to install Node.js and npm here](https://docs.npmjs.com/getting-started/installing-node).

### Working your way around the application

The starter project will come with everything you need to get started
with Microcosm. This also includes a project structure:

```bash
src/
├── actions
├── presenters
├── domains
├── effects
├── style
├── views
├── index.js
├── repo.js
└── routes.js
```

Microcosm follows the
[Model View Presenter (MVP)](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93presenter)
architectural pattern. Don't worry about that too much now, we'll cover it
as we build out a quick application.

### Launch the app

Run the following command in your terminal:

```bash
# Stop the server at any time with ctrl-c
npm start
```

This will probably open your default browser to a new tab at
[http://localhost:3000](http://localhost:3000). Congratulations! You
just created and booted your first Microcosm app!

### Personalize it

The current site copy is cheerful, but a little too generic. This text
lives inside of the application layout file.

Let's update it, open `src/views/layout.js`

```javascript
// src/views/layout.js
import React from 'react'

export default function Layout ({children}) {

  return (
    <div>
      <h1>Solar System</h1>
      {children}
    </div>
  )
}
```

Foreshadowing things to come...

## Define a route

Let's build an application that shows a list of planets. We'll place
that content in an index route, which will display when a user visits
the homepage.

We use [`react-router`](https://github.com/reactjs/react-router) for
routing. It's already included in `microcosm-quickstart`, so let's
go ahead and add an index route.

Crack open `src/routes.js` and edit it to look like:

```javascript
// src/routes.js
import React from 'react'
import {Route, IndexRoute} from 'react-router'

import App from './presenters/application'
import Planets from './presenters/planets'

export default (
  <Route path="/" component={App}>
    <IndexRoute component={Planets} />
  </Route>
)
```

Your build process is probably yelling at you right now with something
like:

```bash
Error in ./src/routes.js
Module not found: ./presenters/planets in ~/microcosm-quickstart/src
```

That's because we haven't added a presenter yet. We'll do that next.

## Define a presenter

Presenters are just special React components that are charged with
higher levels of responsibility. We make a distinction between them
and "passive view" components for a couple of reasons:

1. Presenters provide an answer for where to keep data operations and
   dispatch application actions.
2. Presenters are a gateway. They keep application concerns outside of
   the majority of the presentation layer.
3. Testing and refactoring are significantly easier because everything
   in `src/views` is isolated. It has no idea how the application
   works.

Let's create a presenter! Make a new JavaScript file at
`src/presenters/planets.js`:

```javascript
// src/presenters/planets.js
import React from 'react'
import Presenter from 'microcosm/addons/presenter'

class Planets extends Presenter {

  render () {
    return (
      <ul>
        <li>Mercury</li>
        <li>Venus</li>
        <li>Earth</li>
        <li>Mars</li>
        <li>Jupiter</li>
        <li>Saturn</li>
        <li>Uranus</li>
        <li>Neptune</li>
        <li>Pluto</li>
      </ul>
    )
  }

}

export default Planets
```

Check out the list of planets in your browser! Now you might be asking yourself:

> You said that Presenters isolate the view layer from the
> application. Where's the separation?

And you'd be correct! Let's make a planets list view component. Create
a new React component at `src/views/planet-list.js`:

```javascript
// src/views/planet-list.js
import React from 'react'

export default function PlanetList () {

  return (
    <ul>
      <li>Mercury</li>
      <li>Venus</li>
      <li>Earth</li>
      <li>Mars</li>
      <li>Jupiter</li>
      <li>Saturn</li>
      <li>Uranus</li>
      <li>Neptune</li>
      <li>Pluto</li>
    </ul>
  )
}
```

Then update the Planets presenter to use this new view component:

```javascript
// src/presenters/planets.js
import React from 'react'
import Presenter from 'microcosm/addons/presenter'
import PlanetList from '../views/planet-list'

class Planets extends Presenter {

  render () {
    return <PlanetList />
  }

}

export default Planets

```

Awesome. Well, not _really_. Now the `PlanetList` component knows
all about the data. It shouldn't care whether or not Pluto's a _real_
planet. Let's fix that.

We need to prepare data in the presenter to send down into the `PlanetList`
view. Presenters can implement a `getModel` method that to do just that:

```javascript
// src/presenters/planets
import React from 'react'
import Presenter from 'microcosm/addons/presenter'
import PlanetList from '../views/planet-list'

class Planets extends Presenter {

  getModel () {
    return {
      planets: () => ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto']
    }
  }

  render () {
    const { planets } = this.model

    return <PlanetList planets={planets} />
  }

}

export default Planets
```

And in our PlanetList:

```javascript
// src/views/planet-list.js
import React from 'react'

export default function PlanetList ({ planets = [] }) {

  return (
    <ul>
      { planets.map(p => <li key={p}>{p}</li>)}
    </ul>
  )
}
```

Much better.

## Defining a domain

We can do better. Application data really belongs in Microcosm. To do
this, we need to make a Planets domain. This domain will define all of
the operations for data related to planets. Create a new JavaScript
file at `./src/domains/planets.js`:

```javascript
// src/domains/planets.js
const Planets = {

  getInitialState() {
    return [
      'Mercury', 'Venus', 'Earth', 'Mars',
      'Jupiter', 'Saturn', 'Uranus', 'Neptune',
      'Pluto'
    ]
  }

}

export default Planets
```

We call instances of Microcosm _repos_. An isolated warehouse to
manage application state. Hooking up the planets domain is easy:

```javascript
// src/repo.js
import Microcosm from 'microcosm'
import Planets from './domains/planets'

class Repo extends Microcosm {

  setup () {
    this.addDomain('planets', Planets)
  }

}

export default Repo
```

Here we're saying, "Mount the Planets domain to `'planets'`." It will
managing everything under `repo.state.planets`.

We can subscribe to that in our Planets presenter. Open it up once
more:

```javascript
import React from 'react'
import Presenter from 'microcosm/addons/presenter'
import PlanetList from '../views/planet-list'

class Planets extends Presenter {

  getModel () {
    return {
      // I'm new. Pull planets out of the repo's state
      planets: state => state.planets
    }
  }

  render () {
    const { planets } = this.model

    return <PlanetList planets={planets} />
  }

}

export default Planets
```

Cool. Each value in the key/value map returned from `model` is
processed by the Presenter. When given a function, it will invoke it
with the current application state.

Awesome. Nice and separated.

## Defining an action

Let's simulate what would happen if you were working with a planets
API. In this case, the Planets domain wouldn't know about all of the
planets right on start-up. We need to fetch information from a server.

Microcosm actions are responsible for dealing with asynchronous
state. Let's move the data inside of planets out into an action:

```javascript
// src/actions/planets.js
export function getPlanets() {

  // This isn't *really* an AJAX request, but it
  // accomplishes what we want...
  return new Promise(function (resolve, reject) {
    resolve([
      'Mercury', 'Venus', 'Earth', 'Mars',
      'Jupiter', 'Saturn', 'Uranus', 'Neptune',
      'Pluto'
    ])
  })
}
```

And in the Planet's domain, subscribe to it using the `register()`
function:

```javascript
// src/domains/planets.js
import {getPlanets} from '../actions/planets'

const Planets = {
  getInitialState () {
    // Remember, we put the planets data into the action
    return []
  },

  append (planets, data) {
    return planets.concat(data)
  },

  register () {
    return {
      // Curious? This works because Microcosm assigns a unique
      // toString() method to each action pushed into it. That means
      // the action can be used as a unique key in an object.
      [getPlanets]: this.append
    }
  }
}

export default Planets
```

You might have noticed that the planets went missing from the page. Of
course! We aren't asking for them.

Let's use the Presenter's `setup` lifecycle hook to fetch the planet
when the presenter boots up. `setup` is given the current `repo` for
the presenter specifically for this purpose:

```javascript
// src/presenters/planets.js
import React from 'react'
import Presenter from 'microcosm/addons/presenter'
import PlanetList from '../views/planet-list'
import {getPlanets} from '../actions/planets'

class Planets extends Presenter {

  setup (repo) {
    repo.push(getPlanets)
  }

  getModel () {
    return {
      planets: state => state.planets
    }
  }

  render () {
    const { planets } = this.model

    return <PlanetList planets={planets} />
  }

}

export default Planets
```

And we're back! When the router is about to mount the Planets
presenter to the page, it will call `setup`. This will
cause a `getPlanets` to get queued up with the application's repo.

Microcosm will process the action, sending updates to the domains who
indicate they want to get updates based on their `register` function.

## Handling user interaction

This is looking great, but most applications respond to user interaction
in some way, so lets look at one way to handle that in Microcosm.

Microcosm provides a couple of options for capturing user input and
passing it in to actions. One of these is by using the `ActionButton`
addon. Let's modify our View layer to pull that in:

```javascript
import React from 'react'
import ActionButton from 'microcosm/addons/action-button'
import {addPlanet} from '../actions/planets'

export default function PlanetList ({ planets = [] }) {

  return (
    <div>
      <ul>
        { planets.map(p => <li key={p}>{p}</li>)}
      </ul>

      <ActionButton action={addPlanet} value="Alpha Centauri">
        Add Planet
      </ActionButton>
    </div>
  )
}
```

When clicked, our button will broadcast the `addPlanet` action. This
won't do anything currently because the `addPlanet` action doesn't
exist. Let's create that action and subscribe our Domain to it:

```javascript
// add to src/actions/planets.js
export function addPlanet (planet) {
  return planet
}
```

```javascript
// update register() method in src/domains/planets.js
register () {
  return {
    [getPlanets]: this.append,
    [addPlanet]: this.append
  }
}
```

There we have it! Now we have a button in our view which triggers an
action that adds a new planet to our data model. When the Domain
updates the state with the new planet, our Presenter and View will
update accordingly to display the new data.

## Wrapping up

That's it! You've just gone through a whirlwind tour of Microcosm and
our preferred architecture. Happy trailblazing!
