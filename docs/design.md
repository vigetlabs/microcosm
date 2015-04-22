```
                                                    |--> [Store] ---|
[app.push] ------> [Action] ------> [Dispatcher] ---+--> [Store] ---+--> [app.shouldUpdate?]
   ^                                                |--> [Store] ---|            |
   |                                                                             |
   |                                                                             v
[External Services] <--------------------------------------------------------- [YES]
   |- User Interface
   |- Router
   |- Firebase sync
```
