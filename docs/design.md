# Design

Without getting too lofty, this is roughly the ideal scenario for a
Microcosm:

```
                                              |-→ [Store] -|
[app.send] ---→ [Action] ---→ [app.dispatch] -+-→ [Store] -+-→ [update?]
   ↑                                          |-→ [Store] -|       |
   |                                                               |
   |                                                               ↓
[Plugins] ←---------------------------------------------------- [change]
   |- User Interface
   |- Router
   |- Firebase sync
   ↑
[app.start]
```

1. **Initialize**. Performed by `app.start()`. This gathers initial state
   from stores and boots plugins.
2. **Fire Action**. Performed by `app.send(action, params)`. Pushes an
   action into the queue. If it succeeds, dispatch it to the stores.
3. **Store reconciliation**. Each store that is registered to respond
   to the action returns a new state by operating on a given old state
   within the context of parameters sent by the action.
4. **Change reconciliation**. If any changes to the data model
   occurred, a change event is fired. Plugins can listen to this
   change to perform operations. These might include rendering a new
   UI, persisting application state in `localStorage`, etc.
5. **Repeat steps 2-4**
