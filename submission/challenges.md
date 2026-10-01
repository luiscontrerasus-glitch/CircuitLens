# Challenges

**Perception uncertainty.** A photograph cannot prove hidden breadboard contacts or identify every component value. The implementation uses manual terminal confirmation and an explicitly non-semantic image mask. Automatic recognition is deferred.

**Geometry versus connectivity.** A valid circuit can occupy different rows. Union-find and labeled pin-net signatures compare electrical structure rather than matching coordinates.

**Stale analysis.** Browser testing revealed that field editing could preserve results for an older model. Input edits now invalidate results and require confirmation before another analysis.

**Windows runtime behavior.** Static serving initially rejected valid paths because of trailing-directory normalization. API testing caught and verified the fix. The test runner uses a single process to avoid restricted child-process spawning.

**Honest scope.** Generated fixtures are labeled, calculations state assumptions, and documentation does not claim working AI recognition or measured hardware behavior.
