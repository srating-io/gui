'use client';

import { Button, Modal, Typography, useTheme } from '@esmalley/react-material-ui';


/**
 * Plain language guide to the analysis rows.
 *
 * The caller renders this only while it is open. The library Modal keeps its children mounted
 * once rendered, and there is one of these per tile, so leaving it mounted would ship the whole
 * guide dozens of times over on a full slate.
 */
const Help = (
  { open, onClose }:
  { open: boolean; onClose: (e: React.SyntheticEvent) => void; },
) => {
  const theme = useTheme();

  const headingStyle: React.CSSProperties = { margin: '14px 0px 2px 0px' };
  const bodyStyle: React.CSSProperties = { color: theme.text.secondary };

  return (
    // The guide is taller than a phone viewport and the modal does not scroll on its own,
    // so constrain the paper and let it scroll internally.
    <Modal open = {open} onClose = {onClose} paperStyle = {{ maxHeight: 'calc(100vh - 128px)', overflowY: 'auto' }}>
      <Typography type = 'h6'>How to read this</Typography>

      <Typography type = 'body2' style = {{ color: theme.text.secondary, marginTop: 8 }}>
        Each row puts our projection next to the market line for the same game, so you can see
        where the two disagree and by how much.
      </Typography>

      <Typography type = 'subtitle2' style = {headingStyle}>Edge</Typography>
      <Typography type = 'body2' style = {bodyStyle}>
        The headline number. It is our projected win percentage for a team minus the win
        percentage the market line implies for that same team. <strong>It is a gap between two
        percentages, not a point spread.</strong> If we make a team 55% and the market makes it
        35%, the edge is +20%. Positive means we rate the team higher than the market does, and a
        bigger number means the two disagree more strongly. It measures disagreement, not
        certainty, and a large edge can simply mean the market knows something the model does not.
      </Typography>

      <Typography type = 'subtitle2' style = {headingStyle}>The two win percentages</Typography>
      <Typography type = 'body2' style = {bodyStyle}>
        Our projection comes from team ratings and never looks at the market. The market-implied
        figure is the posted line converted into a percentage, with the built-in margin removed
        so the two sides add to 100%. Removing that margin is what makes the comparison fair.
      </Typography>

      <Typography type = 'subtitle2' style = {headingStyle}>Margin and total</Typography>
      <Typography type = 'body2' style = {bodyStyle}>
        These compare how the game is expected to go, not just who wins. Both margins are written
        from the home team&apos;s side, so a negative number means that team is favoured. You can
        agree with the market on the winner and still disagree sharply on the margin.
      </Typography>

      <Typography type = 'subtitle2' style = {headingStyle}>How much to trust it</Typography>
      <Typography type = 'body2' style = {bodyStyle}>
        Two rows are there to check the rest. Source range shows how far apart the market sources
        are: a wide range means they have not settled on a number, so the edge is built on shaky
        ground. Track record shows how often the model has actually been right this season when it
        projected a win percentage in this range.
      </Typography>

      <Typography type = 'subtitle2' style = {headingStyle}>A projection is not a promise</Typography>
      <Typography type = 'body2' style = {bodyStyle}>
        These are probabilities. If the model says 70% and it is well calibrated, it should still
        be wrong about three times in ten. The track record row is the honest measure of that, and
        it is worth more attention than any single game&apos;s edge.
      </Typography>

      <div style = {{ textAlign: 'right', marginTop: 20 }}>
        <Button onClick = {onClose} title = {'Close'} value = 'close' />
      </div>
    </Modal>
  );
};

export default Help;
