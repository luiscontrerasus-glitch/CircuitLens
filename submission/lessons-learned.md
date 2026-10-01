# Lessons learned from implementation

Explicit uncertainty improves the engineering design: asking for terminals makes the boundary between a photo and a circuit model inspectable.

Electrical identity belongs to nets, not breadboard coordinates. Reference comparison therefore needs a representation independent of physical row placement.

A fault can produce several downstream differences. Findings should not be marketed as an exact count of independent mistakes.

Browser testing complements engine tests. Correct graph calculations do not prevent stale results or awkward editing behavior.

A dependable demo can use generated fixtures honestly when their source is clear and the analysis is executed rather than prerecorded.
