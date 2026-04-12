export function generateDisk(
  R: number,
  slotCount: number,
  slotWidth: number,
  slotDepth: number,
  startAngle: number = -Math.PI
): string {
  const parts: string[] = [];
  const angularStep = (2 * Math.PI) / slotCount;
  const halfWidth = slotWidth / 2;
  const innerR = R - slotDepth;
  // Arc radius needs to account for the slot opening, otherwise the arc
  // doesn't quite meet the slot side at the right angle.
  const arcRadius = Math.sqrt(R * R + halfWidth * halfWidth);

  const slotPoints = (i: number) => {
    const angle = startAngle + i * angularStep;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const tx = -sinA;
    const ty = cosA;
    const bcx = innerR * cosA;
    const bcy = innerR * sinA;
    const b1 = { x: bcx - halfWidth * tx, y: bcy - halfWidth * ty };
    const b2 = { x: bcx + halfWidth * tx, y: bcy + halfWidth * ty };
    const s1 = { x: b1.x + slotDepth * cosA, y: b1.y + slotDepth * sinA };
    const s2 = { x: b2.x + slotDepth * cosA, y: b2.y + slotDepth * sinA };
    return { s1, b1, b2, s2 };
  };

  for (let i = 0; i < slotCount; i++) {
    const { s1, b1, b2, s2 } = slotPoints(i);
    if (i === 0) parts.push(`M${s1.x.toFixed(3)},${s1.y.toFixed(3)}`);
    parts.push(`L${b1.x.toFixed(3)},${b1.y.toFixed(3)}`);
    parts.push(`L${b2.x.toFixed(3)},${b2.y.toFixed(3)}`);
    parts.push(`L${s2.x.toFixed(3)},${s2.y.toFixed(3)}`);
    const next = slotPoints((i + 1) % slotCount);
    parts.push(
      `A${arcRadius.toFixed(3)},${arcRadius.toFixed(3)} 0 0 1 ${next.s1.x.toFixed(3)},${next.s1.y.toFixed(3)}`
    );
  }
  parts.push("Z");
  return parts.join(" ");
}
