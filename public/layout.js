export function terminalPoint(hole) {
  const h = hole.toUpperCase();
  if (h === "VCC") return { x: 85, y: 52 };
  if (h === "GND") return { x: 610, y: 383 };
  const m = /^([A-J])(\d+)$/.exec(h);
  if (!m) return { x: 350, y: 210 };
  const col = m[1].charCodeAt(0) - 65;
  return {
    x: 68 + (Number(m[2]) - 1) * 18.6,
    y: 100 + col * 23 + (col >= 5 ? 24 : 0),
  };
}
