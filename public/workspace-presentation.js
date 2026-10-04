// Presentation metadata only. Engine results remain the source of truth.
export const demoMetadata = {
  healthy: {
    name: "Healthy LED",
    detail: "A complete path",
    type: "Series circuit",
  },
  reversed: {
    name: "Reversed polarity",
    detail: "LED orientation",
    type: "Polarity check",
  },
  disconnected: {
    name: "Open connection",
    detail: "One row away",
    type: "Open path",
  },
  "no-resistor": {
    name: "Missing resistor",
    detail: "Current limiting",
    type: "Protection",
  },
  short: {
    name: "Crossed rails",
    detail: "Supply meets ground",
    type: "Supply short",
  },
  divider: {
    name: "Voltage divider",
    detail: "Split the voltage",
    type: "Voltage division",
  },
  button: {
    name: "Push-button LED",
    detail: "Open and closed",
    type: "Switching",
  },
};
export function summarizeCircuit(circuit, result) {
  return {
    voltage: `${Number(circuit.voltage).toLocaleString("en-US", { maximumFractionDigits: 2 })} V`,
    components: String(circuit.components.length),
    nets: result ? String(result.summary.nets) : "—",
    state:
      result?.status || (circuit.components.length ? "unverified" : "empty"),
    label: result
      ? result.status === "pass"
        ? "Supported checks passed"
        : result.status === "critical"
          ? "Critical · disconnect power"
          : "Connections need review"
      : circuit.components.length
        ? "Confirm to run checks"
        : "Your next circuit starts here",
    findingCount: result ? result.issues.length : null,
  };
}
