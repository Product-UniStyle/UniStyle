export interface SizeChartRow {
  size: string;
  brandSize: string;
  values: number[]; // inches, aligned to SizeChartDef.columns
}

export interface SizeChartDef {
  columns: string[];
  rows: SizeChartRow[];
  howToMeasure: { label: string; text: string }[];
}

// shortcut: generic measurements by category, not per-product/brand. Upgrade to
// per-product charts (stored on Product) if real garment specs are ever provided.
const topsChart: SizeChartDef = {
  columns: ['Chest', 'Front Length', 'Across Shoulder', 'Sleeve Length'],
  rows: [
    { size: 'XS', brandSize: 'XS', values: [34, 26, 16, 22.5] },
    { size: 'S', brandSize: 'S', values: [36, 27, 16.5, 23] },
    { size: 'M', brandSize: 'M', values: [38, 28, 17, 23.5] },
    { size: 'L', brandSize: 'L', values: [40, 29, 17.5, 24] },
    { size: 'XL', brandSize: 'XL', values: [42, 30, 18, 24.5] },
    { size: 'XXL', brandSize: 'XXL', values: [44, 31, 18.5, 25] },
  ],
  howToMeasure: [
    { label: 'Chest', text: 'Measure around the fullest part of your chest, keeping the tape horizontal.' },
    { label: 'Front Length', text: 'Measure from the highest point of the shoulder straight down to the hem.' },
    { label: 'Across Shoulder', text: 'Measure from one shoulder edge to the other, across the back.' },
    { label: 'Sleeve Length', text: 'Measure from the shoulder seam to the end of the cuff.' },
  ],
};

const bottomsChart: SizeChartDef = {
  columns: ['Waist', 'Hip', 'Inseam'],
  rows: [
    { size: 'XS', brandSize: 'XS', values: [28, 36, 29] },
    { size: 'S', brandSize: 'S', values: [30, 38, 29.5] },
    { size: 'M', brandSize: 'M', values: [32, 40, 30] },
    { size: 'L', brandSize: 'L', values: [34, 42, 30.5] },
    { size: 'XL', brandSize: 'XL', values: [36, 44, 31] },
    { size: 'XXL', brandSize: 'XXL', values: [38, 46, 31.5] },
  ],
  howToMeasure: [
    { label: 'Waist', text: 'Measure around your natural waistline, keeping the tape comfortably loose.' },
    { label: 'Hip', text: 'Measure around the fullest part of your hips.' },
    { label: 'Inseam', text: 'Measure from the crotch seam down to the bottom of the leg.' },
  ],
};

const capsChart: SizeChartDef = {
  columns: ['Head Circumference'],
  rows: [{ size: 'One Size', brandSize: 'Free', values: [22.5] }],
  howToMeasure: [
    { label: 'Head Circumference', text: 'Measure around your head, just above the ears, keeping the tape level.' },
  ],
};

export function getSizeChart(category: string): SizeChartDef {
  if (category === 'Bottoms') return bottomsChart;
  if (category === 'Caps') return capsChart;
  return topsChart;
}
