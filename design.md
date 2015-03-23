```
                                                       |--> [Store] ---|
[Signal] --------> [Processing] -----> [Multicast] ----+--> [Store] ---+------> [Update Global State]
   ^                   |- Auth                         |--> [Store] ---|         |
   |                   |- Routing                                                |
   |                                                                             v
   ^------------------------- [Signal] <------------ [User Interaction] <------ [Render]
   |                                                                             |
   ^                                                                             |
   |                                                                             |
[Background Services] <--------------------------------------------------------- +
   |- History API
   |- Window Resize
   |- Mouse move
   |- Server request (for Progression)
   |- Firebase sync
```
