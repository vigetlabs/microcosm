```
                                                       |--> [Store] ---|
[Action] -------> [Processing] ------> [Dispatcher] ---+--> [Store] ---+---> [Update Global State]
   ^                |- Auth                            |--> [Store] ---|          |
   |                |- Routing                                                    |
   |                                                                       <Did It Changed?>
   |                                                                              |
   |                                                                              v
   ^------------------------- [Action] <------------ [User Interaction] <----- [Render]
   |                                                                              |
   ^                                                                              |
   |                                                                              |
[Background Services] <-----------------------------------------------------------+
   |- History API
   |- Window Resize
   |- Mouse move
   |- Server request (for Progression)
   |- Firebase sync
```
