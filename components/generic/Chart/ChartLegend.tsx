'use client';

import LinearScaleIcon from '@esmalley/react-material-icons/LinearScale';
import { Payload } from 'recharts/types/component/DefaultLegendContent';
import { Typography, useTheme } from '@esmalley/react-material-ui';

export type ChartLegendProps = {
  payload?: Payload[];
  /** Keys the reader has switched off. Series stay in their colour slot either way. */
  inactive: string[];
  onToggle: (dataKey: string) => void;
  /** 'horizontal' reads as a row under the plot, 'vertical' as a column beside it. */
  layout?: 'horizontal' | 'vertical';
  size?: 'caption' | 'body2';
};

/**
 * The legend every chart shares.
 *
 * A legend is present for any chart with two or more series, and not because it looks tidy: two of
 * the palette's slots fall below 3:1 against the surface in each theme, and a visible label is what
 * discharges that. It also means identity is never carried by colour alone, which matters for
 * anyone reading the chart without full colour vision.
 *
 * Clicking an entry hides that series. The entry greys out but keeps its position, so the reader
 * can find it again.
 */
const ChartLegend = (
  { payload, inactive, onToggle, layout = 'horizontal', size = 'body2' }: ChartLegendProps,
) => {
  const theme = useTheme();

  if (!payload || !payload.length) {
    return null;
  }

  const vertical = layout === 'vertical';

  const entryStyle: React.CSSProperties = {
    display: vertical ? 'flex' : 'inline-flex',
    alignItems: 'center',
    margin: vertical ? '5px 0px' : '5px 5px',
    cursor: 'pointer',
  };

  return (
    <div style = {{ marginLeft: 10, textAlign: vertical ? 'initial' : 'center' }}>
      {
        payload.map((entry, index) => {
          const dataKey = entry.dataKey ? entry.dataKey.toString() : '';
          const off = Boolean(dataKey && inactive.includes(dataKey));
          const color = off ? theme.grey[500] : entry.color;

          return (
            <div
              key = {`legend-${dataKey || index}`}
              style = {entryStyle}
              onClick = {() => { onToggle(dataKey); }}
            >
              <div style = {{ display: 'flex' }}>
                <LinearScaleIcon style = {{ fontSize: size === 'caption' ? '14px' : '18px', color }} />
              </div>
              <div style = {{ display: 'flex', marginLeft: 5 }}>
                <Typography type = {size} style = {{ color }}>{entry.value}</Typography>
              </div>
            </div>
          );
        })
      }
    </div>
  );
};

export default ChartLegend;
