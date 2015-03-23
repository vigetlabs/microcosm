```
                                                           |--> [Storage] ---|
    [Signal] --------> [Processing] -----> [Multicast] ----+--> [Storage] ---+------> [Reduce Global State]
       ^                   |- Auth                         |--> [Storage] ---|         |
       |                   |- Routing                                                  v
       |                                                                              [Render]
       |                                                                               |
       |                                                                               |
       +------------------------- [Signal] --------------------------------------------+
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
