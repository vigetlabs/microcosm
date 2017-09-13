# Preact

Though the `addons` modules that bundle with Microcosm are designed for React,
we also maintain a `microcosm-preact` project for use with [Preact](https://github.com/developit/preact).

## Usage

Install `microcosm-preact` from npm.

```
npm install --save microcosm-preact
```

From there, it can be used exactly like the standard addons:

```javascript
import Presenter from 'microcosm-preact/presenter'

class MyPresenter extends Presenter {
  view () {
    return <p>All set</p>
  }
}
```
