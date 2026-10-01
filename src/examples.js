const wire = (id, a, b) => ({ id, type: "wire", a, b });
const resistor = (id, a, b, value = 330) => ({
  id,
  type: "resistor",
  a,
  b,
  value,
});
const led = (a, b) => ({ id: "D1", type: "led", a, b });
export const references = {
  led: {
    name: "LED + current limiter",
    voltage: 5,
    components: [
      wire("W1", "VCC", "A5"),
      resistor("R1", "B5", "B12"),
      led("D12", "D18"),
      wire("W2", "A18", "GND"),
    ],
  },
  divider: {
    name: "Equal voltage divider",
    voltage: 5,
    components: [
      wire("W1", "VCC", "A5"),
      resistor("R1", "B5", "B12", 1000),
      resistor("R2", "D12", "D18", 1000),
      wire("W2", "A18", "GND"),
    ],
  },
  button: {
    name: "Button-controlled LED (pressed)",
    voltage: 5,
    components: [
      wire("W1", "VCC", "A5"),
      { id: "S1", type: "button", a: "B5", b: "B8", closed: true },
      resistor("R1", "C8", "C12"),
      led("D12", "D18"),
      wire("W2", "A18", "GND"),
    ],
  },
};
const clone = (k) => structuredClone(references[k]);
function example(id, name, description, reference, mutate, expectedCodes) {
  const circuit = clone(reference);
  mutate?.(circuit);
  return {
    id,
    name,
    description,
    reference,
    circuit,
    expectedCodes,
    image: `/examples/${id}.svg`,
  };
}
export const examples = [
  example(
    "healthy",
    "The first light",
    "A correctly wired LED and a 330 Ω resistor.",
    "led",
    null,
    [],
  ),
  example(
    "reversed",
    "A light that stays dark",
    "Find the backwards LED in an otherwise complete circuit.",
    "led",
    (c) => {
      const p = c.components.find((p) => p.id === "D1");
      [p.a, p.b] = [p.b, p.a];
    },
    ["reversed-led"],
  ),
  example(
    "no-resistor",
    "Too much of a good thing",
    "A jumper takes the place of the current limiter.",
    "led",
    (c) => {
      c.components = c.components.filter((p) => p.id !== "R1");
      c.components.push(wire("W3", "B5", "B12"));
    },
    ["missing-resistor"],
  ),
  example(
    "disconnected",
    "One row away",
    "The ground jumper lands one row too far.",
    "led",
    (c) => (c.components.find((p) => p.id === "W2").a = "A19"),
    ["open-circuit"],
  ),
  example(
    "short",
    "Crossed rails",
    "A misplaced jumper directly bridges power and ground.",
    "led",
    (c) => c.components.push(wire("W3", "VCC", "GND")),
    ["supply-short"],
  ),
  example(
    "divider",
    "Split the difference",
    "Two 1 kΩ resistors produce an ideal 2.5 V output.",
    "divider",
    null,
    [],
  ),
  example(
    "button",
    "Press to illuminate",
    "A closed pushbutton completes the LED circuit.",
    "button",
    null,
    [],
  ),
];
