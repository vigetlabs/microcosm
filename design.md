```
                                                           |--> [Store] ---|
    [Signal] --------> [Processing] -----> [Multicast] ----+--> [Store] ---+------> [Update Global State]
       ^                   |- Auth                         |--> [Store] ---|         |
       |                   |- Routing                                                v
       |                                                                            [Render]
       |                                                                             |
       |                                                                             |
       +------------------------- [Signal] ------------------------------------------+
       |
       ^
       |
    [Background Services]
       |- History API
       |- Window Resize
       |- Mouse move
       |- Server request (for Progression)
       |- Firebase sync

```
