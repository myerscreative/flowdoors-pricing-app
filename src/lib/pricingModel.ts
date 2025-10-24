export interface DoorInput {
  width: number;
  height: number;
  panelCount?: number;
  isSwing?: boolean;
  finish?: "standard" | "black" | "custom";
  glass?: "double" | "triple" | "lowE";
  includeInstall?: boolean;
}

export interface PriceResult {
  panels: number;
  baseCost: number;
  areaSqFt: number;
  totalCost: number;
  retailPrice: number;
  marginPct: number;
  notes: string[];
}

export function calculateDoorPrice({
  width,
  height,
  panelCount,
  isSwing = false,
  finish = "standard",
  glass = "double",
  includeInstall = false,
}: DoorInput): PriceResult {
  const baseCost = isSwing ? 800 : 1200;
  const panelCost = 900;  // includes labor
  const areaRate = 28;    // $/ft² for glass/extrusions
  const markup = 1.8;

  const finishMultiplier =
    finish === "black" ? 1.08 : finish === "custom" ? 1.15 : 1.0;
  const glassMultiplier =
    glass === "triple" ? 1.15 : glass === "lowE" ? 1.05 : 1.0;

  const autoPanels = Math.max(1, Math.round(width / 36));
  const panels = panelCount ?? autoPanels;
  const areaSqFt = (width * height) / 144;

  let totalCost =
    baseCost + panels * panelCost + areaSqFt * areaRate;

  // Apply finish & glass adjustments
  totalCost *= finishMultiplier * glassMultiplier;

  // Compute retail & install add-on
  let retailPrice = totalCost * markup;
  if (includeInstall) retailPrice += 2500;

  const marginPct = parseFloat(
    (((retailPrice - totalCost) / retailPrice) * 100).toFixed(1)
  );

  const notes = [
    `Finish: ${finish}`,
    `Glass: ${glass}`,
    includeInstall ? "Install included (+$2,500)" : "No install",
  ];

  return {
    panels,
    baseCost,
    areaSqFt: parseFloat(areaSqFt.toFixed(2)),
    totalCost: Math.round(totalCost),
    retailPrice: Math.round(retailPrice),
    marginPct,
    notes,
  };
}

