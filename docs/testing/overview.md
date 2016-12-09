# Testing Microcosm

We've put a lot of careful planning into making Microcosm easy to
test. In this section, we'll cover our basic testing setup. Additional
sections touch on the individual pieces of Microcosm.

## Tools

Let's cover a couple of tools that we'll use throughout the guides.

**These are not mandatory**. Examples should be easily translatable to
your existing testing setup. However we've found these tools to be
easy to work with and put them forth as recommendations.

### Jest

Our testing setup centers
around [Jest](http://facebook.github.io/jest/), a testing framework by
Facebook. We like Jest because it is fast, feature rich, and doesn't
require a lot of setup.

Jest leans on [Jasmine](https://github.com/jasmine/jasmine), adding
additional features and a custom test runner. A test may look
something like:

```javascript
describe('Suite name', function () {
  it("test name", function () {
    let answer = 2 + 2

    // This is an assertion. If the result here is not what we expect,
    // it will throw an error. Jest will tell us when this happens.
    expect(answer).toEqual(4)
  })
})
```

Get started with Jest using their [installation guide](http://facebook.github.io/jest/docs/getting-started.html#content)

### Enzyme

[Enzyme](https://github.com/airbnb/enzyme/) is a testing utility for
working with React. It makes it easy to create, manipulate, and
traverse React component trees of any size.

A typical test using Enzyme involves setting up a React component,
interacting with it, and then asserting some value:

```javascript
import React from 'react'
import {mount} from 'enzyme'

import Hello from '../components/hello-world'

describe('<Hello />', function () {
  it('it greets a user at a given name', function () {
    let wrapper = mount(<Hello name="Bill" />)
    let text = wrapper.text()

    expect(text).toEqual('Hello, Bill!')
  })
})
```

We won't get into it, but Enzyme can do quite a bit more. It can also
simulating events, find DOM elements by their component type, and much
more. It has become an essential tool for writing concise UI tests
with React.

### jsdom

Testing UI code often means we have to deal with the browser. This can
be a frustrating experience. Browser testing takes time, can be flaky,
and hog system resources.

To work around this, Jest provides first-class support
for [jsdom](https://github.com/tmpvar/jsdom), a JavaScript
implementation of the web
browser's
[Document Object Model (DOM)](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model). By
using jsdom, we can write unit tests against an environment
very similar to the browser without paying nearly the same cost.

Chances are that you already have jsdom if you've set up Jest. All
that's required is to tell Jest that you would like to use it:

```bash
# Whenever you execute tests, add this flag:
jest --env jsdom
```

Jest will automatically setup and teardown jsdom for every one of your
test suites.

## Wrapping up

That's it! Now that you are familiar with the tools we'll use in the
examples, check out the individual guides for more details.
