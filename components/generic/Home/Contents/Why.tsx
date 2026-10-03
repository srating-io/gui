'use client';

import TrackChangesIcon from '@esmalley/react-material-icons/TrackChanges';
import HistoryIcon from '@esmalley/react-material-icons/History';
import VisibilityIcon from '@esmalley/react-material-icons/Visibility';
import BlockIcon from '@esmalley/react-material-icons/Block';

import { Paper, Typography, useTheme, useWindowDimensions } from '@esmalley/react-material-ui';
import { getColumns, getMaxWidth } from '../ContentsWrapper';


/**
 * The closing band.
 *
 * The last thing before the price list, which settles what it is for: the reader has watched the
 * tools work and now has to decide whether to believe them enough to pay. So all four claims argue
 * one point - that the numbers can be checked - and differ only in the kind of evidence they put
 * up: a score we publish against ourselves, twenty seasons standing behind it, an open front end,
 * and nobody on the other side paying for a particular answer.
 *
 * Calibration leads because it is the only claim here that can be read against us rather than for
 * us, which is exactly what makes it worth going first.
 *
 * The hero has already said "no ads" and the tour's API tab has already shown the endpoint, so
 * neither is restated as a feature. They appear only where they do work for the argument: ads as
 * the incentive nobody has to buy, the API as a way to go and recompute the number yourself.
 */
const Why = () => {
  const theme = useTheme();
  const { width } = useWindowDimensions();

  const columns = getColumns(width);

  const claims = [
    {
      key: 'calibration',
      icon: <TrackChangesIcon style = {{ fontSize: 22, color: theme.success.main }} />,
      title: 'We publish when we\'re wrong',
      body: 'Every projection is scored once the game is played, and the calibration is public - including the confidence bands where we were too bold. A single accuracy percentage would have hidden that.',
    },
    {
      key: 'history',
      icon: <HistoryIcon style = {{ fontSize: 22, color: theme.warning.main }} />,
      title: 'Twenty seasons behind every number',
      body: '75,000 basketball games and 20,000 football games. These are not ratings fit on three weeks of results and pointed at Saturday.',
    },
    {
      key: 'open',
      icon: <VisibilityIcon style = {{ fontSize: 22, color: theme.info.main }} />,
      title: 'Nothing is a black box',
      body: 'The front end is on GitHub and the same data is on the API. If you want to know how a number got on the page, read the code that put it there - or pull the figures and work it out again yourself.',
    },
    {
      key: 'no-ads',
      icon: <BlockIcon style = {{ fontSize: 22, color: theme.error.main }} />,
      title: 'Nobody pays us for a pick',
      body: 'No ads, no affiliate sportsbooks, no sponsored edges. The subscription is the only way money comes in, so a projection has no reason to be anything other than our best guess.',
    },
  ];

  return (
    <section style = {{ width: '100%', maxWidth: getMaxWidth(), margin: '0px auto', padding: '28px 8px 8px 8px' }}>
      <Typography type = 'h5' style = {{ color: theme.text.primary, margin: '0px 0px 14px 0px' }}>Why trust these numbers</Typography>

      <div style = {{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(columns, 2)}, minmax(0, 1fr))`, gap: 10 }}>
        {claims.map((claim) => (
          <Paper key = {claim.key} style = {{ padding: 12, height: '100%' }}>
            <div style = {{ display: 'flex', alignItems: 'center', margin: '0px 0px 6px 0px' }}>
              <span style = {{ display: 'flex', marginRight: 8 }}>{claim.icon}</span>
              <Typography type = 'subtitle1'>{claim.title}</Typography>
            </div>
            <Typography type = 'body2' style = {{ color: theme.text.secondary }}>{claim.body}</Typography>
          </Paper>
        ))}
      </div>
    </section>
  );
};

export default Why;
