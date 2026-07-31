/** Approximate render color for a bulb color temperature. */
export function lightColorFromTemperature(kelvin: number): string {
  if (kelvin <= 2400) return "#ffb347";
  if (kelvin <= 2900) return "#ffd699";
  if (kelvin <= 3500) return "#ffe8c0";
  if (kelvin <= 4500) return "#fff4e0";
  return "#fff9f0";
}
