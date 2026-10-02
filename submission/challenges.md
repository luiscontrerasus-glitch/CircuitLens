# Engineering challenges

Separating visual uncertainty from engineering certainty required a strict observation schema, unresolved values and mandatory review. The graph must not silently inherit a model guess as a measurement. Image changes and observation edits invalidate previous results. API failures must not break the manual workbench. Persistent attempt accounting must include failures and never retry automatically.

Live evaluation uncovered a concrete external blocker: valid credentials can list models while inference still fails for exhausted credits. That failure is documented rather than replaced with fabricated model outputs. Native image dependencies were upgraded after audit findings; the final audit is clean.
