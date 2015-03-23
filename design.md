```
                                                           |--> [Storage] ---|
    [Signal] --------> [Processing] -----> [Multicast] ----+--> [Storage] ---+------> [Render]
       ^                   |- Auth                         |--> [Storage] ---|         |
       |                   |- Routing                                                  |
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

To determine:

- Easier way to send new props
- What does a router look like in this system?
  - Does it redirect Signals?
