'use client';

import { BestPrice } from '@/components/helpers/Odds';
import Odds from '@/components/helpers/Odds';
import { Button, Divider, Modal, Typography, useTheme } from '@esmalley/react-material-ui';


/**
 * Every market source that priced the side, so the best number can be seen in context.
 *
 * The caller renders this only while it is open: the library Modal keeps its children mounted,
 * and there is one Analysis per tile.
 */
const Sources = (
  { open, onClose, team, prices }:
  { open: boolean; onClose: (e: React.SyntheticEvent) => void; team: string; prices: BestPrice[]; },
) => {
  const theme = useTheme();

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 12,
    padding: '6px 0px',
  };

  return (
    <Modal open = {open} onClose = {onClose} paperStyle = {{ maxHeight: 'calc(100vh - 64px)', overflowY: 'auto' }}>
      <Typography type = 'h6'>{`Market sources: ${team}`}</Typography>
      <Typography type = 'body2' style = {{ color: theme.text.secondary, margin: '8px 0px' }}>
        Every source we track that has priced this side, most favourable first. The gap between
        the top and bottom of this list is what the source range row measures.
      </Typography>

      <Divider style = {{ margin: '4px 0px' }} />

      {prices.map((row, index) => (
        <div key = {row.key} style = {rowStyle}>
          <Typography type = 'body2' style = {{ color: index === 0 ? theme.text.primary : theme.text.secondary }}>{row.title}</Typography>
          <Typography
            type = 'body2'
            style = {{
              color: index === 0 ? theme.success.main : theme.text.secondary,
              fontWeight: index === 0 ? 700 : 400,
              whiteSpace: 'nowrap',
            }}
          >{Odds.formatPrice(row.price)}</Typography>
        </div>
      ))}

      {
        prices.length ?
          '' :
          <Typography type = 'body2' style = {{ color: theme.text.secondary }}>No source has priced this side yet.</Typography>
      }

      <div style = {{ textAlign: 'right', marginTop: 16 }}>
        <Button onClick = {onClose} title = {'Close'} value = 'close' />
      </div>
    </Modal>
  );
};

export default Sources;
