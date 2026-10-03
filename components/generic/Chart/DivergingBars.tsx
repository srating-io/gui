'use client';

import { Tooltip, Typography, useTheme, useWindowDimensions } from '@esmalley/react-material-ui';

import { getChartPalette } from './palette';

export type DivergingBar = {
  key: string;
  label: string;
  /** -1 to 1, where positive is better than the middle of the league and 0 is the middle. */
  value: number;
  /**
   * Read at the end of the bar, normally the raw figure and its rank. A node rather than a string
   * so the rank can arrive as the same RankSpan the rest of the app prints.
   */
  detail: React.ReactNode;
  tooltip?: string;
};

/**
 * Every measure as one bar either side of the league's middle, longest first.
 *
 * The stat grid below answers "what is this number" for forty numbers and never answers "which of
 * these forty matters". Sorted by how far from ordinary each one is, the answer is the top of the
 * list and the bottom of it: what this team does that nobody else does, and what it cannot do. It
 * is the closest thing the page has to a description of a team rather than a record of one.
 *
 * Length is percentile distance from the middle of the league, not a z-score. A z-score would need
 * the spread of the league on each stat and the page holds one team's row, so the honest measure
 * available here is rank - which has the side benefit of being distribution free, so a stat with a
 * long tail does not get to shout louder than one without.
 */
const ChartDivergingBars = (
  {
    bars,
    title,
    positiveLabel = 'better',
    negativeLabel = 'worse',
    limit,
  }:
  {
    bars: DivergingBar[];
    title?: string;
    positiveLabel?: string;
    negativeLabel?: string;
    /** Keep this many in total, split evenly between the best and the worst. All when omitted. */
    limit?: number;
  },
) => {
  const theme = useTheme();
  const palette = getChartPalette(theme);
  const { width } = useWindowDimensions();

  const narrow = width <= 500;
  const labelWidth = narrow ? 76 : 116;
  const detailWidth = narrow ? 86 : 112;

  // strengths down to weaknesses, so the column reads top to bottom as the team's shape
  const usable = [...bars]
    .filter((bar) => Number.isFinite(bar.value))
    .sort((a, b) => b.value - a.value);

  /**
   * Trimming by absolute size looks right and is wrong: for a team near the top of the league the
   * twelve most extreme measures are all strengths, and the chart fills with twelve full length
   * bars that say "good" twelve times. Taking from both ends instead guarantees the weaknesses are
   * on the page, which for a strong team is the only part a reader does not already know.
   */
  const getShown = () => {
    if (!limit || usable.length <= limit) {
      return usable;
    }

    const half = Math.floor(limit / 2);

    return [...usable.slice(0, limit - half), ...usable.slice(usable.length - half)];
  };

  const ordered = getShown();

  if (!ordered.length) {
    return null;
  }

  const getBar = (bar: DivergingBar) => {
    const positive = bar.value >= 0;
    const magnitude = Math.min(Math.abs(bar.value), 1);

    const label = (
      <Typography type = 'caption' style = {{ color: theme.text.secondary }}>{bar.label}</Typography>
    );

    return (
      <div key = {bar.key} style = {{ display: 'flex', alignItems: 'center', padding: '3px 0px' }}>
        <div style = {{ width: labelWidth, flexShrink: 0, textAlign: 'right', paddingRight: 10, overflow: 'hidden' }}>
          {bar.tooltip ? <Tooltip position = 'top' text = {bar.tooltip}>{label}</Tooltip> : label}
        </div>
        <div style = {{ position: 'relative', flex: 1, height: 16, minWidth: 90 }}>
          {/* the centre is the league's middle, and it is drawn because every bar's meaning is
              its distance from it */}
          <div style = {{
            position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, backgroundColor: palette.muted,
          }} />
          <div style = {{
            position: 'absolute',
            top: 2,
            bottom: 2,
            // grows out from the centre rather than from an edge, so the two halves are readable
            // against each other rather than only against themselves
            left: positive ? '50%' : `${50 - (magnitude * 50)}%`,
            width: `${magnitude * 50}%`,
            backgroundColor: positive ? palette.diverging(0) : palette.diverging(1),
            borderRadius: 2,
          }} />
        </div>
        <div style = {{
          width: detailWidth, flexShrink: 0, paddingLeft: 10, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center',
        }}>
          <Typography type = 'caption' style = {{ color: theme.text.secondary }}>{bar.detail}</Typography>
        </div>
      </div>
    );
  };

  return (
    <div style = {{ padding: '0px 5px' }}>
      <div style = {{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <Typography type = 'body1'>{title || 'What stands out'}</Typography>
        <div style = {{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style = {{
            width: 10, height: 10, borderRadius: 2, backgroundColor: palette.diverging(1), display: 'inline-block',
          }} />
          <Typography type = 'caption' style = {{ color: theme.text.secondary }}>{negativeLabel}</Typography>
          <span style = {{
            width: 10, height: 10, borderRadius: 2, backgroundColor: palette.diverging(0), display: 'inline-block', marginLeft: 8,
          }} />
          <Typography type = 'caption' style = {{ color: theme.text.secondary }}>{positiveLabel}</Typography>
        </div>
      </div>
      {ordered.map((bar) => getBar(bar))}
    </div>
  );
};

export default ChartDivergingBars;
