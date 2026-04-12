import { MM_PER_SVG, TOP_INNER_PATHS, BOTTOM_HOLE } from "./constants";
import { generateAllParts, type Part } from "./parts";

export function generateCutSheetSVG(thicknessMM: number): string {
  const parts = generateAllParts(thicknessMM);
  const date = new Date().toISOString().slice(0, 10);

  // Layout in SVG units
  const margin = 60;
  const labelGap = 60;
  const colGap = 80;
  const rowGap = 80;
  const headerH = 140;
  const footerH = 120;

  const findPart = (key: string): Part => {
    const p = parts.find((p) => p.key === key);
    if (!p) throw new Error(`Cut sheet: missing part ${key}`);
    return p;
  };

  // Left column: stretchers
  const sA = findPart("A");
  const sB = findPart("B");
  const leftColWidth = sA.bbox.width + colGap + sB.bbox.width;
  const leftColHeight = Math.max(sA.bbox.height, sB.bbox.height);

  // Right column: leaves on top, disks below
  const leafKeys = ["XS", "S", "M", "L", "XL"];
  const leaves = leafKeys.map(findPart);
  const leavesRowWidth =
    leaves.reduce((sum, p) => sum + p.bbox.width, 0) + colGap * (leaves.length - 1);
  const leavesRowHeight = Math.max(...leaves.map((p) => p.bbox.height));
  const bottomDisk = findPart("BOTTOM_DISK");
  const topDisk = findPart("TOP_DISK");
  const disksRowWidth = bottomDisk.bbox.width + colGap + topDisk.bbox.width;
  const disksRowHeight = Math.max(bottomDisk.bbox.height, topDisk.bbox.height);
  const rightColWidth = Math.max(leavesRowWidth, disksRowWidth);
  const rightColHeight = leavesRowHeight + labelGap + rowGap + disksRowHeight;

  const bodyWidth = leftColWidth + colGap + rightColWidth;
  const bodyHeight = Math.max(leftColHeight, rightColHeight);
  const totalWidth = margin * 2 + bodyWidth;
  const totalHeight = margin * 2 + headerH + bodyHeight + footerH + labelGap * 2;

  const widthMM = (totalWidth * MM_PER_SVG).toFixed(1);
  const heightMM = (totalHeight * MM_PER_SVG).toFixed(1);

  // Place a part with translate so its bbox top-left lands at (x, y).
  // Disk inner cutouts share the same parent translate (they're already in
  // the disk's local frame, centred at origin) so no double-shifting.
  const placePart = (part: Part, x: number, y: number): string => {
    const dx = x - part.bbox.minX;
    const dy = y - part.bbox.minY;
    let inner = "";
    if (part.type === "topDisk") {
      inner = TOP_INNER_PATHS.map(
        (p) => `<path d="${p}" fill="none" stroke="#000" stroke-width="0.5"/>`
      ).join("");
    } else if (part.type === "bottomDisk") {
      inner = `<path d="${BOTTOM_HOLE}" fill="none" stroke="#000" stroke-width="0.5"/>`;
    }
    return `<g transform="translate(${dx.toFixed(2)}, ${dy.toFixed(2)})"><path d="${part.path}" fill="none" stroke="#000" stroke-width="0.5"/>${inner}</g>`;
  };

  const labelPart = (part: Part, centerX: number, y: number): string => {
    return `<text x="${centerX.toFixed(2)}" y="${y.toFixed(2)}" font-family="Helvetica, Arial, sans-serif" font-size="22" text-anchor="middle" fill="#000">${part.label} · cut ${part.count}</text>
<text x="${centerX.toFixed(2)}" y="${(y + 28).toFixed(2)}" font-family="Helvetica, Arial, sans-serif" font-size="18" text-anchor="middle" fill="#444">${part.sizeMM.w} × ${part.sizeMM.h} mm</text>`;
  };

  const headerY = margin + 50;
  const headerText = `<text x="${margin}" y="${headerY}" font-family="Helvetica, Arial, sans-serif" font-size="42" font-weight="bold" fill="#000">Jesper Makes — Cone Lamp cut sheet</text>
<text x="${margin}" y="${(headerY + 50).toFixed(2)}" font-family="Helvetica, Arial, sans-serif" font-size="24" fill="#000">Wood thickness: ${thicknessMM.toFixed(1)} mm  ·  9 unique parts  ·  159 total pieces  ·  generated ${date}</text>`;

  const bodyY = margin + headerH;

  // Left column: stretchers
  const sAX = margin;
  const sAY = bodyY;
  const sBX = sAX + sA.bbox.width + colGap;
  const sBY = bodyY;

  // Right column: leaves
  const rightColX = margin + leftColWidth + colGap;
  let leafX = rightColX;
  const leavesPlacements = leaves.map((leaf) => {
    const leafY = bodyY + (leavesRowHeight - leaf.bbox.height);
    const placement = {
      part: leaf,
      x: leafX,
      y: leafY,
      centerX: leafX + leaf.bbox.width / 2,
    };
    leafX += leaf.bbox.width + colGap;
    return placement;
  });

  // Right column: disks
  const disksY = bodyY + leavesRowHeight + labelGap + rowGap;
  const disksTotalWidth = bottomDisk.bbox.width + colGap + topDisk.bbox.width;
  const disksStartX = rightColX + (rightColWidth - disksTotalWidth) / 2;
  const bdX = disksStartX;
  const bdY = disksY;
  const tdX = disksStartX + bottomDisk.bbox.width + colGap;
  const tdY = disksY;

  const footerY = totalHeight - margin - 60;
  const footerText = `<text x="${margin}" y="${footerY}" font-family="Helvetica, Arial, sans-serif" font-size="20" fill="#000">Generated on jespermakes.com — free for personal use only.</text>
<text x="${margin}" y="${(footerY + 28).toFixed(2)}" font-family="Helvetica, Arial, sans-serif" font-size="20" fill="#000">Do not sell these plans. Do not re-upload to other platforms without explicit permission.</text>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${widthMM}mm" height="${heightMM}mm" viewBox="0 0 ${totalWidth.toFixed(2)} ${totalHeight.toFixed(2)}">
  <rect x="0" y="0" width="${totalWidth.toFixed(2)}" height="${totalHeight.toFixed(2)}" fill="#fff"/>
  ${headerText}
  ${placePart(sA, sAX, sAY)}
  ${labelPart(sA, sAX + sA.bbox.width / 2, sAY + sA.bbox.height + 30)}
  ${placePart(sB, sBX, sBY)}
  ${labelPart(sB, sBX + sB.bbox.width / 2, sBY + sB.bbox.height + 30)}
  ${leavesPlacements
    .map(
      (p) =>
        placePart(p.part, p.x, p.y) +
        labelPart(p.part, p.centerX, bodyY + leavesRowHeight + 30)
    )
    .join("\n  ")}
  ${placePart(bottomDisk, bdX, bdY)}
  ${labelPart(bottomDisk, bdX + bottomDisk.bbox.width / 2, bdY + bottomDisk.bbox.height + 30)}
  ${placePart(topDisk, tdX, tdY)}
  ${labelPart(topDisk, tdX + topDisk.bbox.width / 2, tdY + topDisk.bbox.height + 30)}
  ${footerText}
</svg>`;
}
