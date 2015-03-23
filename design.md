```
                                                    |--> [Store] ---|
[App.send] ------> [Action] ------> [Dispatcher] ---+--> [Store] ---+--> [Update Global State?]
   ^                                                |--> [Store] ---|          |
   |                                                                           |
   |                                                                           v
[External Services] <------------------------------------------------------- [YES]
   |- User Interface
   |- Router
   |- Firebase sync
```
