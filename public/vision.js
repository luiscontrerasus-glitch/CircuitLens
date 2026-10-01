// A deliberately non-semantic visual aid: never use this mask as electrical evidence.
export function colorFeatureMask(data) {
  if (!(data instanceof Uint8ClampedArray) || data.length % 4 !== 0)
    throw new Error("Expected RGBA image pixels.");
  const output = new Uint8ClampedArray(data);
  let selected = 0;
  for (let i = 0; i < data.length; i += 4) {
    const max = Math.max(data[i], data[i + 1], data[i + 2]);
    const min = Math.min(data[i], data[i + 1], data[i + 2]);
    if (
      data[i + 3] > 0 &&
      max > 65 &&
      max - min > 65 &&
      (max - min) / Math.max(max, 1) > 0.4
    ) {
      output.set([210, 242, 81], i);
      selected++;
    } else {
      const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
      output[i] = output[i + 1] = output[i + 2] = gray * 0.65 + 70;
    }
  }
  return {
    data: output,
    selected,
    percentage: data.length ? (400 * selected) / data.length : 0,
  };
}
