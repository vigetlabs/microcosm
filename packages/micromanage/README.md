# Micromanage

Data management in Microcosm is very low level. A developer must manipulate data themselves. Micromanage seeks to increase the level of abstraction when working with data in Microcosm. Through this, it seeks to achieve a few goals:

1. Reduced data management boilerplate
2. Caching
3. Queries and better Presenter view modelling
4. Easier testing and decoupling from API requirements

## Design goals

- Create an "Entity" for each data record
- Entity properties are lazy computed. Do not build a record on storage, only as needed. This should improve memory efficiency.
- Entities should pass an equality check if created using the same parameters
- Entities should be observable
- No nulls. Ever. Ever.
  - loading state (record hasn't loaded. we think it exists, but don't know)
  - complete state (record loaded)
  - refresh state (have record, refetching)
  - error state (record failed to load)
- Entity errors fail with consistent messages. 404, 500, etc, should be easy to report to users
- Entities generate a unique identity hash code, usable for caching and querying

## API Design thoughts

### Before

```javascript
import { Domain } from 'microcosm'

function getWidget (id) {
  return fetch(`/widgets/${id}`).then(res => res.json)
}

class Widgets extends Domain {
  getInitialState() {
    return []
  }
  addWidget(widgets, widget) {
    return widgets.concat(widget)
  }
  register() {
    return {
      [getWidget]: this.addWidget
    }
  }
}

class WidgetShow extends Presenter {
  getModel(repo, { id }) {
    return {
      widget: repo.domains.widgets.map(widgets => widgets.find(w => w.id === id))
    }
  }

  ready(repo, props) {
    repo.push(getWidget, props.id
  }

  update(repo, props) {
    if (props.id !== this.props.id) {
      repo.push(getWidget, props.id)
    }
  }
}
```

### After

```javascript
import { Entity, Collection } from 'micromanage'

class Widget extends Entity {
  static schema = {
    id: String,
    name: String,
    weight: Number
  }
}

class Widgets extends Collection(Widget) {
  // Intentionally left blank, but you could include your own stuff
}

class WidgetShow extends Presenter {
  getModel(repo, { id }) {
    return {
      widget: repo.domains.widgets.find(1)
    }
  }
}
```
