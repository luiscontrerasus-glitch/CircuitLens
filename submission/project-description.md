# CircuitLens — Make the right connection

A breadboard can look almost correct while one misplaced lead stops an LED from lighting. CircuitLens helps students and makers turn that confusing image into an inspectable electrical model and a specific debugging lesson.

The upgraded workbench has an optional runtime vision path: consented image pixels go to OpenAI, which is asked for structured visual observations rather than diagnoses. The user reviews boxes, terminal candidates, values, polarity and confidence; accepts, rejects or corrects each detection; then constructs a circuit graph. Deterministic rules compare that confirmed graph with the intended design and explain the evidence, electrical consequence and proposed fix.

The useful fallback is already functional: seven labeled fixture circuits and a full manual netlist editor demonstrate correct wiring, reversed polarity, a missing resistor, a disconnected jumper, a rail short, a divider and a pushbutton. Three additional synthetic images exercise the separate image-analysis entry point without secretly supplying a fixture netlist to the model.

The runtime OpenAI integration is implemented, but successful live recognition has not been verified. On October 1, five Responses API attempts (correct image three times, reversed once, disconnected once) returned HTTP 429; the diagnostic response identified `credit_balance_exhausted` / `insufficient_quota`. Authentication and access to the selected model were separately verified with HTTP 200 from the models endpoint. No successful model observations, recognition accuracy, or real-hardware validation are claimed. Automated/provider-simulated checks and manual graph demos are separate evidence.

The project aims to help beginners practice reasoned debugging and help instructors show why a connection matters. These are proposed benefits, not measured outcomes. No schools, users or partnerships are claimed. The educational tool cannot certify electrical safety or inspect hidden contacts.
