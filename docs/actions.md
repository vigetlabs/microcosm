# Actions

Actions, as values, describe the signals passed through Microcosm. As
functions they allow one to prepare data before sending it to Stores
for state transformation.

Microcosm takes advantage of the `toString` method to coerce Actions
into unique identifiers. This allows Actions to be passed around like
values, fulfilling the role of constant values in traditional flux:

```javascript
import { tag } from 'tag'

let MyActions = tag({

  doSomething(params) {
    return params
  }

}
```

Tag will clone an object and set a `toString` method on each key. This
`toString` method returns a unique identifier for the action.

## Calling actions

Microcosms send signals. Otherwise there would be no way to figure out
which instance of a Microcosm should change data:

```javascript
let app = new Microcosm()

app.send(MyActions.doSomething)
```

## Callback Shorthand

`app.send` curries actions. This makes it easier to use actions as
callbacks:

```javascript
<button onClick={ app.send(Action) }>Do something</button>
```

## Promises

Microcosms will wait for Actions that return promises, only
dispatching if they resolve successfully.
