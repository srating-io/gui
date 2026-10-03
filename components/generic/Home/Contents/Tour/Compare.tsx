'use client';

import QueryStatsIcon from '@esmalley/react-material-icons/QueryStats';

import { ChartPercentileRadar } from '@/components/generic/Chart';

import TrendsExample from './examples/TrendsExample';
import Panel from './Panel';
import Section from './Section';
import { RANKED_PLAYERS, radarPlayer, radarSpokes } from './data/team';
import { useTheme } from '@esmalley/react-material-ui';

/**
 * The compare tool.
 *
 * The trends chart is the chip-switched one the landing page has carried for years, and it earns
 * its place here rather than being rebuilt: it is the same chart the compare tool draws, and the
 * chips are the one thing on this page a reader can touch before they have gone anywhere else.
 *
 * The radar sits here rather than with the rankings because this tool compares players as well as
 * teams, and because a profile is only interesting held against another one - which is the whole
 * argument for the page it links to.
 */
const Compare = ({ path }: { path: string }) => {
  const theme = useTheme();

  return (
    <Section
      eyebrow = 'The compare tool'
      headline = 'Put any two teams side by side.'
      body = {
        'Stats, players and the whole season of form, on one chart rather than in two tabs a few ' +
        'seconds apart. Pick a statistic and every line refits to it.'
      }
      bullets = {[
        'Any two teams',
        'Stats, players and trends',
        'Against the conference and the league',
      ]}
      icon = {<QueryStatsIcon style = {{ fontSize: 22, color: theme.info.main }} />}
      href = {`/${path}/compare`}
      cta = 'Open the compare tool'
    >
      <Panel
        span = {2}
        reserve = {360}
        caption = 'Where were they in January? Any statistic over time, against its conference and against the league. Try the chips.'
      >
        <TrendsExample />
      </Panel>

      <Panel
        span = {1}
        reserve = {290}
        caption = 'And for players: six percentiles against everyone ranked, with the rank beside the shape - because a radar is only honest about shape.'
      >
        <ChartPercentileRadar
          spokes = {radarSpokes}
          max = {RANKED_PLAYERS}
          title = {`Skill profile · ${radarPlayer}`}
          height = {260}
        />
      </Panel>
    </Section>
  );
};

export default Compare;
