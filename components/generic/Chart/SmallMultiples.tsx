'use client';

import {
  LineChart, Line, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Payload } from 'recharts/types/component/DefaultLegendContent';

import ChartLegend from './ChartLegend';
import LazyPanel from './LazyPanel';
import ChartTooltip from './ChartTooltip';
import useInactiveSeries from './useInactiveSeries';
import { getChartPalette } from './palette';
import HelperChart from '@/components/helpers/Chart';
import RankSpan from '@/components/generic/RankSpan';
import { Typography, useTheme, useWindowDimensions } from '@esmalley/react-material-ui';

export type SmallMultiplePanel = {
  /** Stable key, normally the column name. */
  key: string;
  label: string;
  /** The field on each row this panel plots. */
  dataKey: string;
  /** Optional current standing, shown beside the label. */
  rank?: number;
  /** For a measure where 1 is the best - a rank - so climbing it draws a line going up. */
  reversed?: boolean;
};

export type SmallMultipleSeries = {
  /** Stable key. Carries the legend entry and the hide toggle, so it cannot be a dataKey - each
   *  panel plots a different field for the same series. */
  key: string;
  /** Legend entry. Falls back to the panel's own label, which is right for a lone series. */
  name?: string;
  /** Prepended to each panel's dataKey to reach this series' field on the row. */
  prefix?: string;
  /** Palette slot, so a color belongs to the entity and not to its position in the array. */
  slot: number;
  /** Shows this series' rank out of `rankMax` in the tooltip, as the one-stat chart does. */
  showRank?: boolean;
};

/** One line, the panel's own measure, for a caller that has nothing to compare it against. */
const DEFAULT_SERIES: SmallMultipleSeries[] = [{ key: 'value', prefix: '', slot: 0, showRank: true }];

/**
 * The same season plotted once per statistic, side by side on a shared time axis.
 *
 * The chip row this sits beside can only ever show one statistic at a time, which makes the most
 * interesting thing in a season invisible: that the offence climbed *while* the defence fell away
 * is a relationship between two lines, and flipping between two charts a few seconds apart is not
 * a way to see a relationship. Laid out together the shape of the season is one read.
 *
 * Each panel keeps its own y scale, because these are different measures and forcing them onto a
 * common one would either flatten everything or invent a comparison the numbers do not support.
 * What is shared is the x axis - every panel covers the same dates in the same order - so the eye
 * can travel down a column and find the same week in every statistic.
 *
 * Series are shared too: the same two or three lines in every panel, in the same colors, named
 * once in a legend at the top rather than restated a hundred times in panels too small to hold a
 * legend each. Switching one off there switches it off everywhere, and the axes refit to what is
 * left.
 */
const ChartSmallMultiples = (
  {
    rows,
    panels,
    xAxisDataKey,
    rankMax = 0,
    tooltipLabel,
    series = DEFAULT_SERIES,
  }:
  {
    rows: object[];
    panels: SmallMultiplePanel[];
    xAxisDataKey: string;
    rankMax?: number;
    tooltipLabel?: string;
    series?: SmallMultipleSeries[];
  },
) => {
  const theme = useTheme();
  const palette = getChartPalette(theme);
  const { width } = useWindowDimensions();
  const inactiveSeries = useInactiveSeries();

  if (!rows.length || !panels.length) {
    return null;
  }

  const panelHeight = 110;

  const visibleSeries = series.filter((one) => !inactiveSeries.isHidden(one.key));

  // one panel per row on a phone, two on a tablet, and as many as fit past that. Below about
  // 200px a line stops being readable, so the count is capped rather than letting them shrink
  const getColumns = () => {
    if (width < 560) {
      return 1;
    }

    if (width < 900) {
      return 2;
    }

    if (width < 1300) {
      return 3;
    }

    return 4;
  };

  const columns = getColumns();

  const getPanel = (panel: SmallMultiplePanel) => {
    let bounds: [number | null, number | null] = [null, null];
    let latest: number | null = null;

    for (const row of rows) {
      // the axis has to fit every line that gets drawn, the comparisons included
      for (const one of visibleSeries) {
        bounds = HelperChart.extend(bounds, row[`${one.prefix || ''}${panel.dataKey}`]);
      }

      if (row[panel.dataKey] !== null && row[panel.dataKey] !== undefined) {
        latest = row[panel.dataKey];
      }
    }

    const domain = HelperChart.getDomain(bounds[0], bounds[1]);

    return (
      <div key = {panel.key} style = {{ width: `${100 / columns}%`, padding: '6px 8px', boxSizing: 'border-box' }}>
        <div style = {{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography type = 'caption' style = {{ color: theme.text.secondary }}>{panel.label}</Typography>
          <div style = {{ display: 'flex', alignItems: 'center' }}>
            <Typography type = 'caption'>{latest === null ? '-' : latest}</Typography>
            {panel.rank && rankMax ? <RankSpan rank = {panel.rank} max = {rankMax} useOrdinal = {true} /> : ''}
          </div>
        </div>
        <LazyPanel height = {panelHeight}>
          <ResponsiveContainer width = '100%' height = '100%'>
            {/* the top and bottom margins are the room the two axis labels sit in; without them
                recharts hangs each one half outside the panel and clips it */}
            <LineChart data = {rows} margin = {{ top: 8, right: 6, bottom: 8, left: 0 }}>
              {/* the axis earns its place by making the panel's range readable, but its line and
                  tick marks would be more ink than the one line that matters, so they go. Two
                  labels, the floor and the ceiling, are what a reader needs to size the climb -
                  recharts' own tick picking lands on a single label at this height, which tells
                  you where the top is and nothing about how far the line has travelled */}
              <YAxis
                {...(domain ? { domain, ticks: domain } : {})}
                reversed = {Boolean(panel.reversed)}
                width = {44}
                tickLine = {false}
                axisLine = {false}
                interval = {0}
                tick = {{ fontSize: 10 }}
              />
              <Tooltip
                cursor = {{ stroke: palette.muted, strokeWidth: 1 }}
                content = {
                  <ChartTooltip
                    rankMax = {rankMax}
                    formatLabel = {(row, label) => row[tooltipLabel || xAxisDataKey] || label}
                  />
                }
              />
              {
                series.map((one) => (
                  <Line
                    key = {one.key}
                    hide = {inactiveSeries.isHidden(one.key)}
                    type = 'monotone'
                    name = {one.name || panel.label}
                    dataKey = {`${one.prefix || ''}${panel.dataKey}`}
                    stroke = {palette.series(one.slot)}
                    strokeWidth = {2}
                    dot = {false}
                    connectNulls = {true}
                    // hijacking the unit param to put a rank in the tooltip, as the one-stat
                    // chart does
                    unit = {one.showRank ? 'rank' : undefined}
                    // a hundred panels drawing themselves in at once is a second of animation
                    // nobody asked for, and the ones off screen have finished before they are seen
                    isAnimationActive = {false}
                  />
                ))
              }
            </LineChart>
          </ResponsiveContainer>
        </LazyPanel>
      </div>
    );
  };

  /**
   * One legend for the whole grid.
   *
   * Identity is the same in every panel, so naming it once is both less ink and the only place a
   * legend fits - a 110px panel has no room for one, and the palette's weaker slots need a visible
   * label somewhere to carry their meaning.
   */
  const getLegend = () => {
    if (series.length < 2) {
      return null;
    }

    const payload: Payload[] = series.map((one) => ({
      value: one.name || one.key,
      dataKey: one.key,
      color: palette.series(one.slot),
    }));

    return (
      <ChartLegend
        payload = {payload}
        inactive = {inactiveSeries.inactive}
        onToggle = {inactiveSeries.toggle}
        layout = 'horizontal'
        size = 'caption'
      />
    );
  };

  const first = rows[0];
  const last = rows[rows.length - 1];

  return (
    <div style = {{ padding: '0px 5px' }}>
      {getLegend()}
      <div style = {{ display: 'flex', flexWrap: 'wrap' }}>
        {panels.map((panel) => getPanel(panel))}
      </div>
      {/* the x axis is the same on every panel, so it is stated once here rather than drawn
          twelve times */}
      <Typography type = 'caption' style = {{ color: theme.text.secondary, display: 'block', textAlign: 'center', marginTop: 5 }}>
        {first[tooltipLabel || xAxisDataKey]} &rarr; {last[tooltipLabel || xAxisDataKey]}
      </Typography>
    </div>
  );
};

export default ChartSmallMultiples;
