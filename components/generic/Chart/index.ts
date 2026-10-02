/**
 * The chart kit.
 *
 * The default export stays the line chart, so the call sites that predate this directory keep
 * working through the same `@/components/generic/Chart` import.
 *
 * Two rules hold across everything in here, and both are easier to keep than to retrofit:
 *
 *   - One y-axis. Two measures on different scales belong in two panels, in small multiples, or
 *     indexed to a common base - never on a second axis, where the alignment between the two
 *     scales is arbitrary and invents a correlation the data does not contain.
 *   - Colour follows the entity, not its rank. See palette.ts.
 */
import Line from './Line';

export default Line;

export { default as ChartLine } from './Line';
export { default as ChartScatter } from './Scatter';
export { default as ChartRankStrip } from './RankStrip';
export { default as ChartSmallMultiples } from './SmallMultiples';
export { default as ChartDivergingArea } from './DivergingArea';
export { default as ChartCalibration } from './Calibration';
export { default as ChartSequenceStrip } from './SequenceStrip';
export { default as ChartDivergingBars } from './DivergingBars';
export { default as ChartBandLine } from './BandLine';
export { default as ChartDumbbell } from './Dumbbell';
export { default as ChartPercentileRadar } from './PercentileRadar';
export { default as ChartHistogram } from './Histogram';
export { default as ChartResidual } from './Residual';
export { default as ChartCorrelationMatrix } from './CorrelationMatrix';
export { default as ChartLegend } from './ChartLegend';
export { default as ChartTooltip } from './ChartTooltip';
export { default as useInactiveSeries } from './useInactiveSeries';
export { getChartPalette, getCategorical } from './palette';

export type { ChartLegendProps } from './ChartLegend';
export type { ChartTooltipProps, ChartTooltipEntry } from './ChartTooltip';
export type { ScatterPoint } from './Scatter';
export type { RankStripRow } from './RankStrip';
export type { SmallMultiplePanel, SmallMultipleSeries } from './SmallMultiples';
export type { CalibrationPoint } from './Calibration';
export type { SequenceCell } from './SequenceStrip';
export type { DivergingBar } from './DivergingBars';
export type { DumbbellRow } from './Dumbbell';
export type { RadarSpoke } from './PercentileRadar';
export type { ResidualPoint } from './Residual';
export type { CorrelationMeasure } from './CorrelationMatrix';
export type { InactiveSeries } from './useInactiveSeries';
export type { ChartPalette } from './palette';
