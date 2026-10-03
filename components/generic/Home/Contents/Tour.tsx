'use client';

import { useState } from 'react';

import { Tab, Typography, useTheme, useWindowDimensions } from '@esmalley/react-material-ui';

import Api from './Tour/Api';
import Compare from './Tour/Compare';
import Projections from './Tour/Projections';
import Rankings from './Tour/Rankings';
import Schedules from './Tour/Schedules';
import { getMaxWidth } from '../ContentsWrapper';


/**
 * The five tools, one at a time.
 *
 * Laid out end to end these sections ran to seven thousand pixels, which put the price list far
 * enough down the page that nobody scrolling casually would ever reach it - and a landing page
 * that buries its own pricing is not doing its job however good the charts above it are.
 *
 * So the tour is a tab bar. Every tool is still named and one click away, which is the part that
 * matters for advertising them, but the page only ever spends the height of one. The charts are
 * unchanged: whichever tool is open shows the same panels it did before.
 *
 * Rankings leads because it is the product's centre of gravity and the one a visitor is most
 * likely to have come for.
 */
const tabs = [
  { value: 'rankings', title: 'Rankings', short: 'Rankings' },
  { value: 'projections', title: 'Projections', short: 'Projections' },
  { value: 'compare', title: 'Compare', short: 'Compare' },
  { value: 'schedules', title: 'Teams & schedules', short: 'Teams' },
  { value: 'api', title: 'API', short: 'API' },
];

const Tour = ({ path }: { path: string }) => {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const [selected, setSelected] = useState(tabs[0].value);

  // the long titles say more, and are worth the room whenever there is room to spend
  const narrow = width > 0 && width < 760;

  const getSelected = () => {
    if (selected === 'projections') {
      return <Projections path = {path} />;
    }

    if (selected === 'compare') {
      return <Compare path = {path} />;
    }

    if (selected === 'schedules') {
      return <Schedules path = {path} />;
    }

    if (selected === 'api') {
      return <Api />;
    }

    return <Rankings path = {path} />;
  };

  return (
    <div style = {{ width: '100%', maxWidth: getMaxWidth(), margin: '0px auto', padding: '24px 8px 0px 8px' }}>
      <Typography type = 'h5' style = {{ textAlign: 'center', color: theme.text.primary, margin: '0px 0px 4px 0px' }}>
        Five tools, thirteen ways to read a season
      </Typography>
      <Typography type = 'body2' style = {{ textAlign: 'center', color: theme.text.secondary, margin: '0px 0px 12px 0px' }}>
        Pick one. Every chart below is the one the live page draws, on numbers from a real season.
      </Typography>

      <div style = {{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', borderBottom: `1px solid ${theme.grey[theme.mode === 'dark' ? 800 : 300]}` }}>
        {tabs.map((tab) => (
          <Tab
            key = {tab.value}
            title = {narrow ? tab.short : tab.title}
            value = {tab.value}
            selected = {tab.value === selected}
            onClick = {() => { setSelected(tab.value); }}
          />
        ))}
      </div>

      {getSelected()}
    </div>
  );
};

export default Tour;
