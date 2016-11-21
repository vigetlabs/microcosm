# Examples

1. [What's in here](whats-in-here)
   * [Chatbot](chatbot)
   * [Painter](painter)
   * [ReactRouter](reactrouter)
   * [SimpleSVG](simplesvg)
2. [Run the examples](run-the-examples)
3. [Project Structure](project-structure)

## What's in here

### ChatBot

A messaging client that interacts with a chat bot. This example
demonstrates optimistic updates, asynchronous requests, and loading
states.

### Painter

A simple drawing application. Click tiles across a grid to flip them
between black and white. This example was created to test the
[time-travel debugger for Microcosm](https://github.com/vigetlabs/microcosm-debugger).

### ReactRouter

Demonstrates use of Microcosm with ReactRouter.

### SimpleSVG

An animated SVG example that uses actions to animate the orbiting of
one circle around another. Demonstrates the thunk usage pattern for
actions.


## Run the examples

To run these examples, install project dependencies and execute `npm
start` in any of the directories:

```
$ git clone https://github.com/vigetlabs/microcosm
$ cd microcosm
$ npm install

$ cd examples/simple-svg
$ make
```
